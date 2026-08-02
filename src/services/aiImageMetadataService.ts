import { File } from 'expo-file-system'
import OpenAI from 'openai'
import { config } from '@/config/config'
import {
    getSelectedFootageItemsForAiMetadataRegeneration,
    getSelectedFootageItemsMissingAiMetadata,
    updateFootageItemAiMetadata,
} from '@/repositories/footageItemRepository'
import {
    AiImageMetadata,
    AiImageMetadataBatchSummary,
    AiImageMetadataOptions,
} from '@/types/aiImageMetadata'
import { FootageItem } from '@/types/footageItem'

const metadataPrompt = `
Return only valid JSON with this exact shape:
{
	"title": "Short human-readable title",
	"description": "A concise description of what is visible in the image",
	"tags": ["walking", "outside", "nature"]
}

Rules:
- The title must be short.
- The description must only describe visible content.
- The tags must be short lowercase strings.
- Do not identify private individuals.
- Do not infer identity, ethnicity, health, disability, emotion, or other sensitive traits.
- Do not make medical claims.
- Use cautious wording such as "appears to show" when uncertain.
- Do not include markdown.
`

export async function generateAiMetadataForSelectedFootageItems(
    options: AiImageMetadataOptions = {},
): Promise<AiImageMetadataBatchSummary> {
    const summary: AiImageMetadataBatchSummary = {
        processed: 0,
        skipped: 0,
        succeeded: 0,
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
            const metadata = await generateAiMetadataForFootageItem(client, item)
            const wasSaved = await updateFootageItemAiMetadata(item.id, metadata)

            if (!wasSaved) {
                summary.failed += 1
                console.warn(`Failed to save AI metadata for footage item ${item.id}`)
                continue
            }

            summary.succeeded += 1
        } catch (error) {
            summary.failed += 1
            console.warn(`Failed to generate AI metadata for footage item ${item.id}:`, error)
        }
    }

    console.info('Generated AI image metadata', summary)

    return summary
}

async function generateAiMetadataForFootageItem(
    client: OpenAI,
    item: FootageItem,
): Promise<AiImageMetadata> {
    const imageBase64 = await readImageAsBase64(item.fileUri)

    const response = await client.responses.create({
        model: config.OPENAI_VISION_MODEL,
        input: [
            {
                role: 'user',
                content: [
                    {
                        type: 'input_text',
                        text: metadataPrompt,
                    },
                    {
                        type: 'input_image',
                        image_url: `data:image/jpeg;base64,${imageBase64}`,
                        detail: 'low',
                    },
                ],
            },
        ],
    })

    const rawText = response.output_text
    const parsed = parseJsonObject(rawText)
    const metadata = validateAiImageMetadata(parsed)

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
                        text: `${metadataPrompt}

The previous response was invalid. Return valid JSON only.`,
                    },
                    {
                        type: 'input_image',
                        image_url: `data:image/jpeg;base64,${imageBase64}`,
                        detail: 'low',
                    },
                ],
            },
        ],
    })

    const retryParsed = parseJsonObject(retryResponse.output_text)
    const retryMetadata = validateAiImageMetadata(retryParsed)

    if (!retryMetadata) {
        throw new Error('AI metadata response failed validation')
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
