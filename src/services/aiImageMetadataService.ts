import { File } from 'expo-file-system'
import OpenAI from 'openai'

import { config } from '@/config/config'
import {
    getPhotoFootageItemsForCaptureEvent,
    getSelectedFootageItemsForAiMetadataRegeneration,
    getSelectedFootageItemsMissingAiMetadata,
    getVideoFootageItemsForAiMetadataRegeneration,
    getVideoFootageItemsMissingAiMetadata,
    markSelectedFootageItemAsCandidate,
    updateFootageItemAiMetadata,
} from '@/repositories/footageItemRepository'
import {
    AiImageMetadata,
    AiImageMetadataBatchSummary,
    AiImageMetadataDecision,
    AiImageMetadataOptions,
} from '@/types/aiImageMetadata'
import { FootageItem } from '@/types/footageItem'

const metadataPrompt = `
You are helping create useful memory cues for a dementia-focused lifelogging app.

The image comes from a first-person wearable camera. The generated text may be shown later to help a person revisit moments from their day. Write in a simple, natural, familiar style.

You will receive the image capture datetime. Use it only as helpful context for time of day, such as morning, afternoon, evening, or night. Do not include the exact timestamp unless it is useful and natural.

Avoid repeating the same generic phrases. Do not overuse words like "quiet", "peaceful", "calm", or "moment". Use them only when they are strongly supported by the image. Prefer concrete activity and place descriptions.

You may receive a previous accepted image. If the current image is too visually similar to the previous accepted image, reject it instead of creating metadata. Reject only when it appears to show the same place, activity, and scene with little new information.

Important:
- Create the title, description, and tags for the current image only.
- The previous accepted image is only for similarity comparison.
- Do not describe the previous accepted image.
- If a previous accepted image is provided, use it only to decide whether the current image is too similar.

Return only valid JSON with this exact shape:
{
 "action": "accept",
 "metadata": {
 "title": "Short personal memory cue",
 "description": "A warm, concise memory cue based on what is visible",
 "tags": ["walking", "outside", "nature"]
 },
 "similarityReason": null
}

Or, if the current image is too similar to the previous accepted image:
{
 "action": "reject_similar",
 "metadata": null,
 "similarityReason": "Short reason why this is too similar"
}

Style:
- Make the title short, specific, and natural.
- The description should be one sentence.
- Focus on what makes this image useful as a memory cue.
- Prefer concrete wording such as "In the kitchen", "Walking outside", "At the shops", "Sitting at the table", "Looking at the garden", or "Getting ready to leave".
- It is acceptable to make gentle everyday assumptions, for example "having a meal", "going for a walk", "spending time at home", or "being outside", when the image supports it.
- Use the capture datetime to make time-of-day wording more accurate when relevant.
- Vary the wording between images.
- Avoid clinical, technical, or overly objective wording.
- Avoid saying "the image shows" unless needed.
- Do not mention dementia, memory loss, AI, metadata, camera, wearable device, or timestamp in the output.

Safety:
- Do not identify private individuals.
- Do not infer identity, ethnicity, health, disability, emotion, relationships, or other sensitive traits.
- Do not make medical claims.
- Do not state uncertain assumptions as fact.
- Use cautious wording such as "looks like", "appears to be", or "possibly" when unsure.
- Do not invent specific names, dates, or events.
- Do not include markdown.

Tags:
- Tags must be short lowercase strings.
- Tags should describe useful everyday context.
- Prefer tags such as "home", "meal", "outside", "walking", "shopping", "kitchen", "garden", "travel", "resting", "pets", "nature", "street", "indoors", "table", "food", "doorway", "car", "morning", "afternoon", "evening", "night".
- Avoid sensitive tags about health, identity, emotion, ethnicity, religion, politics, or disability.
`

const videoMetadataPrompt = `
You are helping create useful memory cues for a dementia-focused lifelogging app.

You will receive several first-person photos from the same capture event as a video. Use the photos as visual context to create metadata for the video. The generated text may be shown later to help a person revisit moments from their day. Write in a simple, natural, familiar style.

You will receive the video capture datetime and the context photo datetimes. Use them only as helpful context for time of day, such as morning, afternoon, evening, or night. Do not include exact timestamps unless useful and natural.

Return only valid JSON with this exact shape:
{
 "title": "Short personal memory cue",
 "description": "A warm, concise memory cue based on the shared visual context",
 "tags": ["walking", "outside", "nature"]
}

Style:
- Make the title short, specific, and natural.
- The description should be one sentence.
- Focus on what the video is likely about based on the surrounding photos.
- Prefer concrete wording such as "In the kitchen", "Walking outside", "At the shops", "Sitting at the table", "Looking at the garden", or "Getting ready to leave".
- It is acceptable to make gentle everyday assumptions when the photos support them.
- Use the capture datetime to make time-of-day wording more accurate when relevant.
- Avoid saying "the video shows" or "the photos show" unless needed.
- Do not mention dementia, memory loss, AI, metadata, camera, wearable device, burst photos, capture events, or timestamps in the output.

Safety:
- Do not identify private individuals.
- Do not infer identity, ethnicity, health, disability, emotion, relationships, or other sensitive traits.
- Do not make medical claims.
- Do not state uncertain assumptions as fact.
- Use cautious wording such as "looks like", "appears to be", or "possibly" when unsure.
- Do not invent specific names, dates, or events.
- Do not include markdown.

Tags:
- Tags must be short lowercase strings.
- Tags should describe useful everyday context.
- Prefer tags such as "home", "meal", "outside", "walking", "shopping", "kitchen", "garden", "travel", "resting", "pets", "nature", "street", "indoors", "table", "food", "doorway", "car", "morning", "afternoon", "evening", "night".
- Avoid sensitive tags about health, identity, emotion, ethnicity, religion, politics, or disability.
`

const MAX_VIDEO_CONTEXT_IMAGES = 8

export async function generateAiMetadataForSelectedFootageItems(
    options: AiImageMetadataOptions = {},
): Promise<AiImageMetadataBatchSummary> {
    const summary: AiImageMetadataBatchSummary = {
        processed: 0,
        skipped: 0,
        succeeded: 0,
        rejectedSimilar: 0,
        failed: 0,
    }

    if (!config.OPENAI_API_KEY) {
        console.warn('OpenAI API key is missing. Skipping AI image metadata generation.')
        return summary
    }

    const items = options.force
        ? await getSelectedFootageItemsForAiMetadataRegeneration(options.limit)
        : await getSelectedFootageItemsMissingAiMetadata(options.limit)

    const client = new OpenAI({
        apiKey: config.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    })

    let previousAcceptedImageBase64: string | null = null
    let previousAcceptedItemId: string | null = null
    let previousAcceptedCreatedAt: string | null = null

    for (const item of items) {
        if (!item.id) {
            summary.skipped += 1
            continue
        }

        if (!options.force && hasAiMetadata(item)) {
            summary.skipped += 1
            continue
        }

        summary.processed += 1

        try {
            const currentImageBase64 = await readImageAsBase64(item.fileUri)
            const decision = await generateAiMetadataDecisionForFootageItem(
                client,
                currentImageBase64,
                item.createdAt,
                previousAcceptedImageBase64,
                previousAcceptedCreatedAt,
            )

            if (decision.action === 'reject_similar') {
                const wasDemoted = await markSelectedFootageItemAsCandidate(
                    item.id,
                    `Rejected by AI metadata processing: similar_to_previous${
                        decision.similarityReason ? ` - ${decision.similarityReason}` : ''
                    }`,
                )

                if (!wasDemoted) {
                    summary.failed += 1
                    console.warn(`Failed to demote similar footage item ${item.id}`)
                    continue
                }

                summary.rejectedSimilar += 1
                continue
            }

            if (!decision.metadata) {
                summary.failed += 1
                console.warn(
                    `AI metadata decision accepted without metadata for footage item ${item.id}`,
                )
                continue
            }

            const wasSaved = await updateFootageItemAiMetadata(item.id, decision.metadata)

            if (!wasSaved) {
                summary.failed += 1
                console.warn(`Failed to save AI metadata for footage item ${item.id}`)
                continue
            }

            previousAcceptedImageBase64 = currentImageBase64
            previousAcceptedItemId = item.id
            previousAcceptedCreatedAt = item.createdAt
            summary.succeeded += 1
        } catch (error) {
            summary.failed += 1
            console.warn(
                `Failed to generate AI metadata for footage item ${item.id}. Previous accepted item: ${previousAcceptedItemId}`,
                error,
            )
        }
    }

    console.info('Generated AI image metadata', summary)

    return summary
}

export async function generateAiMetadataForVideoFootageItems(
    options: AiImageMetadataOptions = {},
): Promise<AiImageMetadataBatchSummary> {
    const summary: AiImageMetadataBatchSummary = {
        processed: 0,
        skipped: 0,
        succeeded: 0,
        rejectedSimilar: 0,
        failed: 0,
    }

    if (!config.OPENAI_API_KEY) {
        console.warn('OpenAI API key is missing. Skipping AI video metadata generation.')
        return summary
    }

    const videos = options.force
        ? await getVideoFootageItemsForAiMetadataRegeneration(options.limit)
        : await getVideoFootageItemsMissingAiMetadata(options.limit)

    const client = new OpenAI({
        apiKey: config.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    })

    for (const video of videos) {
        if (!video.id || !video.captureEventId) {
            summary.skipped += 1
            continue
        }

        if (!options.force && hasAiMetadata(video)) {
            summary.skipped += 1
            continue
        }

        summary.processed += 1

        try {
            const contextPhotos = await getPhotoFootageItemsForCaptureEvent(video.captureEventId)

            if (contextPhotos.length === 0) {
                summary.skipped += 1
                continue
            }

            const sampledPhotos = sampleContextPhotos(contextPhotos, MAX_VIDEO_CONTEXT_IMAGES)
            const contextImages = await readContextImagesAsBase64(sampledPhotos)

            if (contextImages.length === 0) {
                summary.failed += 1
                console.warn(`No readable context photos found for video footage item ${video.id}`)
                continue
            }

            const metadata = await generateAiMetadataForVideoFromContextImages(
                client,
                video.createdAt,
                contextImages,
            )

            const wasSaved = await updateFootageItemAiMetadata(video.id, metadata)

            if (!wasSaved) {
                summary.failed += 1
                console.warn(`Failed to save AI metadata for video footage item ${video.id}`)
                continue
            }

            summary.succeeded += 1
        } catch (error) {
            summary.failed += 1
            console.warn(`Failed to generate AI metadata for video footage item ${video.id}`, error)
        }
    }

    console.info('Generated AI video metadata', summary)

    return summary
}

async function generateAiMetadataDecisionForFootageItem(
    client: OpenAI,
    currentImageBase64: string,
    currentCreatedAt: string,
    previousAcceptedImageBase64: string | null,
    previousAcceptedCreatedAt: string | null,
): Promise<AiImageMetadataDecision> {
    const content: OpenAI.Responses.ResponseInputContent[] = [
        {
            type: 'input_text',
            text: previousAcceptedImageBase64
                ? `${metadataPrompt}

Current image capture datetime: ${formatAiDatetime(currentCreatedAt)}
Previous accepted image capture datetime: ${
                      previousAcceptedCreatedAt ? formatAiDatetime(previousAcceptedCreatedAt) : 'Unknown'
                  }

You will receive two labelled images:
1. Previous accepted image, use only for similarity comparison.
2. Current image, create metadata for this image only.

Compare the current image with the previous accepted image. Reject the current image only if it is too similar and adds little new information. If accepted, describe only the current image.`
                : `${metadataPrompt}

Current image capture datetime: ${formatAiDatetime(currentCreatedAt)}

You will receive one labelled image:
1. Current image, create metadata for this image only.

There is no previous accepted image. You must evaluate the current image on its own.`,
        },
    ]

    if (previousAcceptedImageBase64) {
        content.push({
            type: 'input_text',
            text: 'Previous accepted image, use only for similarity comparison. Do not describe this image in the metadata.',
        })

        content.push({
            type: 'input_image',
            image_url: `data:image/jpeg;base64,${previousAcceptedImageBase64}`,
            detail: 'low',
        })
    }

    content.push({
        type: 'input_text',
        text: 'Current image, create the title, description, and tags for this image only.',
    })

    content.push({
        type: 'input_image',
        image_url: `data:image/jpeg;base64,${currentImageBase64}`,
        detail: 'low',
    })

    const response = await client.responses.create({
        model: config.OPENAI_VISION_MODEL,
        input: [
            {
                role: 'user',
                content,
            },
        ],
    })

    const decision = validateAiImageMetadataDecision(parseJsonObject(response.output_text))

    if (decision) {
        return decision
    }

    const retryResponse = await client.responses.create({
        model: config.OPENAI_VISION_MODEL,
        input: [
            {
                role: 'user',
                content: [
                    {
                        type: 'input_text',
                        text: `${metadataPrompt}

Current image capture datetime: ${formatAiDatetime(currentCreatedAt)}

The previous response was invalid. Return valid JSON only with action, metadata, and similarityReason. If accepting, describe only the current image.`,
                    },
                    ...content.filter(item => item.type === 'input_image' || item.type === 'input_text'),
                ],
            },
        ],
    })

    const retryDecision = validateAiImageMetadataDecision(parseJsonObject(retryResponse.output_text))

    if (!retryDecision) {
        throw new Error('AI metadata decision failed validation')
    }

    return retryDecision
}

async function generateAiMetadataForVideoFromContextImages(
    client: OpenAI,
    videoCreatedAt: string,
    contextImages: { base64: string; createdAt: string }[],
): Promise<AiImageMetadata> {
    const content: OpenAI.Responses.ResponseInputContent[] = [
        {
            type: 'input_text',
            text: `${videoMetadataPrompt}

Video capture datetime: ${formatAiDatetime(videoCreatedAt)}

Context photo datetimes:
${contextImages.map((image, index) => `${index + 1}. ${formatAiDatetime(image.createdAt)}`).join('\n')}

You will receive labelled context photos. Use them only as context for the video metadata.`,
        },
    ]

    for (const [index, image] of contextImages.entries()) {
        content.push({
            type: 'input_text',
            text: `Context photo ${index + 1}, captured at ${formatAiDatetime(image.createdAt)}.`,
        })

        content.push({
            type: 'input_image',
            image_url: `data:image/jpeg;base64,${image.base64}`,
            detail: 'low',
        })
    }

    const response = await client.responses.create({
        model: config.OPENAI_VISION_MODEL,
        input: [
            {
                role: 'user',
                content,
            },
        ],
    })

    const metadata = validateAiImageMetadata(parseJsonObject(response.output_text))

    if (metadata) {
        return metadata
    }

    const retryResponse = await client.responses.create({
        model: config.OPENAI_VISION_MODEL,
        input: [
            {
                role: 'user',
                content: [
                    {
                        type: 'input_text',
                        text: `${videoMetadataPrompt}

Video capture datetime: ${formatAiDatetime(videoCreatedAt)}

The previous response was invalid. Return valid JSON only with title, description, and tags.`,
                    },
                    ...content.filter(item => item.type === 'input_image' || item.type === 'input_text'),
                ],
            },
        ],
    })

    const retryMetadata = validateAiImageMetadata(parseJsonObject(retryResponse.output_text))

    if (!retryMetadata) {
        throw new Error('AI video metadata failed validation')
    }

    return retryMetadata
}

async function readImageAsBase64(fileUri: string): Promise<string> {
    const file = new File(fileUri)

    if (!file.exists) {
        throw new Error(`Image file does not exist: ${fileUri}`)
    }

    if (file.size <= 0) {
        throw new Error(`Image file is empty: ${fileUri}`)
    }

    return file.base64()
}

async function readContextImagesAsBase64(
    items: FootageItem[],
): Promise<{ base64: string; createdAt: string }[]> {
    const contextImages: { base64: string; createdAt: string }[] = []

    for (const item of items) {
        try {
            const base64 = await readImageAsBase64(item.fileUri)

            contextImages.push({
                base64,
                createdAt: item.createdAt,
            })
        } catch (error) {
            console.warn(`Skipping unreadable context photo ${item.id}`, error)
        }
    }

    return contextImages
}

function sampleContextPhotos(items: FootageItem[], maxCount: number): FootageItem[] {
    if (items.length <= maxCount) {
        return items
    }

    const result: FootageItem[] = []
    const lastIndex = items.length - 1

    for (let index = 0; index < maxCount; index += 1) {
        const sourceIndex = Math.round((index / (maxCount - 1)) * lastIndex)
        result.push(items[sourceIndex])
    }

    return result
}

function formatAiDatetime(value: string): string {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return `${date.toISOString()} (${getTimeOfDayLabel(date)})`
}

function getTimeOfDayLabel(date: Date): string {
    const hour = date.getHours()

    if (hour >= 5 && hour < 12) {
        return 'morning'
    }

    if (hour >= 12 && hour < 17) {
        return 'afternoon'
    }

    if (hour >= 17 && hour < 22) {
        return 'evening'
    }

    return 'night'
}

function hasAiMetadata(item: FootageItem): boolean {
    return Boolean(item.title?.trim() && item.description?.trim() && item.tagsJson?.trim())
}

function parseJsonObject(rawText: string): unknown {
    const trimmedText = rawText.trim()

    try {
        return JSON.parse(trimmedText)
    } catch {
        const startIndex = trimmedText.indexOf('{')
        const endIndex = trimmedText.lastIndexOf('}')

        if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
            return null
        }

        return JSON.parse(trimmedText.slice(startIndex, endIndex + 1))
    }
}

function validateAiImageMetadataDecision(value: unknown): AiImageMetadataDecision | null {
    if (!value || typeof value !== 'object') {
        return null
    }

    const record = value as Record<string, unknown>
    const action = record.action

    if (action === 'reject_similar') {
        return {
            action: 'reject_similar',
            metadata: null,
            similarityReason: normalizeText(record.similarityReason),
        }
    }

    if (action !== 'accept') {
        return null
    }

    const metadata = validateAiImageMetadata(record.metadata)

    if (!metadata) {
        return null
    }

    return {
        action: 'accept',
        metadata,
        similarityReason: null,
    }
}

function validateAiImageMetadata(value: unknown): AiImageMetadata | null {
    if (!value || typeof value !== 'object') {
        return null
    }

    const record = value as Record<string, unknown>
    const title = normalizeText(record.title)
    const description = normalizeText(record.description)
    const tags = normalizeTags(record.tags)

    if (!title || !description || tags.length === 0) {
        return null
    }

    return {
        title,
        description,
        tags,
    }
}

function normalizeText(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null
    }

    const normalized = value.trim().replace(/\s+/g, ' ')

    return normalized.length > 0 ? normalized : null
}

function normalizeTags(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return []
    }

    const normalizedTags = value
        .filter((tag): tag is string => typeof tag === 'string')
        .map(tag =>
            tag
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, '')
                .replace(/\s+/g, '-'),
        )
        .filter(tag => tag.length > 0 && tag.length <= 32)

    return Array.from(new Set(normalizedTags)).slice(0, config.AI_IMAGE_METADATA_MAX_TAGS)
}
