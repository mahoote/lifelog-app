import { Image } from 'react-native'

import { db } from '@/database'
import { mapRowToFootageItem } from '@/mappers/footageMapper'
import { FootageItem, FootageItemRow, FootageRole, FootageType } from '@/types/footageItem'

/**
 * Result from the first version of the image quality check.
 *
 * This is intentionally simple for now. The later version can replace this
 * with blur detection, for example Laplacian variance through OpenCV or a
 * local helper service.
 */
export interface ImageQualityResult {
    width: number
    height: number
    megapixels: number
    sizeBytes: number
    resolutionScore: number
    fileSizeScore: number
    qualityScore: number
    passes: boolean
    reason: string | null
}

/**
 * Summary returned after a processing run.
 */
export interface ProcessFootageResult {
    processedCount: number
    selectedCount: number
    failedCount: number
}

// First-version thresholds. These are prototype values, not clinically or
// experimentally validated values.
const MIN_WIDTH = 640
const MIN_HEIGHT = 480
const MIN_SIZE_BYTES = 40_000
const MIN_QUALITY_SCORE = 0.55

/**
 * Reads the pixel dimensions of an image through React Native.
 *
 * Image.getSize works for local file URIs and remote URIs. In this app the
 * expected input is the local file_uri stored in footage_item.
 */
function getImageSize(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        Image.getSize(
            uri,
            (width, height) => resolve({ width, height }),
            error => {
                const message = typeof error === 'string' ? error : 'Failed to read image size.'
                reject(error instanceof Error ? error : new Error(message))
            },
        )
    })
}

/**
 * Keeps a score inside the 0 to 1 range.
 */
function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value))
}

/**
 * Performs the current image quality check for one footage item.
 *
 * Current checks:
 * - minimum image resolution
 * - minimum file size
 * - simple combined quality score
 *
 * The guide recommends blur, exposure, content and quality scores. This first
 * implementation only covers the quality gate that can be done without adding
 * native OpenCV or AI dependencies.
 */
async function checkImageQuality(item: FootageItem): Promise<ImageQualityResult> {
    const { width, height } = await getImageSize(item.fileUri)
    const megapixels = (width * height) / 1_000_000

    // Resolution score rewards images up to roughly 1280 by 720.
    const resolutionScore = clamp01(Math.min(width / 1280, height / 720))

    // File size is used as a rough proxy for whether the image has enough data.
    // It does not prove sharpness, but it catches very small or broken files.
    const fileSizeScore = clamp01(item.sizeBytes / 250_000)

    // Weighted quality score for the prototype version.
    const qualityScore = 0.7 * resolutionScore + 0.3 * fileSizeScore

    let reason: string | null = null

    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        reason = 'Image resolution is too low.'
    } else if (item.sizeBytes < MIN_SIZE_BYTES) {
        reason = 'Image file size is too small.'
    } else if (qualityScore < MIN_QUALITY_SCORE) {
        reason = 'Image quality score is too low.'
    }

    return {
        width,
        height,
        megapixels,
        sizeBytes: item.sizeBytes,
        resolutionScore,
        fileSizeScore,
        qualityScore,
        passes: reason === null,
        reason,
    }
}

/**
 * Loads all photo items that still need processing.
 *
 * Only burst and candidate images are processed. Selected images are skipped
 * because they have already passed the selection step.
 */
async function getUnprocessedPhotoItems(): Promise<FootageItem[]> {
    const rows = await db.getAllAsync<FootageItemRow>(
        `
        SELECT
            id,
            capture_event_id,
            sequence_index,
            type,
            role,
            created_at,
            file_uri,
            size_bytes,
            state,
            duration_s,
            imported_at,
            day_key,
            is_favorite,
            notes,
            tags_json,
            is_processed
        FROM footage_item
        WHERE type = ?
          AND is_processed = 0
          AND role IN (?, ?)
        ORDER BY capture_event_id ASC, created_at ASC;
        `,
        [FootageType.PHOTO, FootageRole.BURST, FootageRole.CANDIDATE],
    )

    return rows.map(mapRowToFootageItem)
}

/**
 * Marks a footage item as processed.
 *
 * The note is optional. Existing notes are kept if no new note is provided.
 */
async function setItemProcessed(id: string, notes: string | null = null): Promise<void> {
    await db.runAsync(
        `
        UPDATE footage_item
        SET is_processed = 1,
            notes = COALESCE(?, notes)
        WHERE id = ?;
        `,
        [notes, id],
    )
}

/**
 * Updates the role for a footage item.
 */
async function setItemRole(id: string, role: FootageRole): Promise<void> {
    await db.runAsync(
        `
        UPDATE footage_item
        SET role = ?
        WHERE id = ?;
        `,
        [role, id],
    )
}

/**
 * Groups footage items by their capture event.
 *
 * This supports the burst-photo logic where one representative photo should be
 * selected for each event. If an item does not have a capture_event_id, it is
 * processed as its own group so the processing function still completes.
 */
function groupByCaptureEvent(items: FootageItem[]): Map<string, FootageItem[]> {
    const groups = new Map<string, FootageItem[]>()

    for (const item of items) {
        const key = item.captureEventId ?? item.id ?? item.createdAt
        const existing = groups.get(key) ?? []
        existing.push(item)
        groups.set(key, existing)
    }

    return groups
}

/**
 * Processes every unprocessed photo in footage_item.
 *
 * Pipeline:
 * 1. Load all unprocessed photos with role burst or candidate.
 * 2. Group them by capture_event_id.
 * 3. Run the current image quality check for each photo.
 * 4. Select the highest scoring passing image in each event.
 * 5. Change that image role to selected.
 * 6. Keep the other images as burst.
 * 7. Mark every attempted image as processed.
 *
 * This function does not run AI labelling yet. It only performs the first
 * quality-selection step from the local vision pipeline guide.
 */
export async function processUnprocessedFootageImages(): Promise<ProcessFootageResult> {
    const items = await getUnprocessedPhotoItems()
    const groups = groupByCaptureEvent(items)

    let processedCount = 0
    let selectedCount = 0
    let failedCount = 0

    for (const group of groups.values()) {
        const scoredItems: { item: FootageItem; quality: ImageQualityResult }[] = []

        // Score each image independently. If scoring fails, mark that item as
        // processed so it does not block future processing runs forever.
        for (const item of group) {
            if (!item.id) continue

            try {
                const quality = await checkImageQuality(item)
                scoredItems.push({ item, quality })
            } catch {
                failedCount += 1
                await setItemProcessed(item.id, 'Image quality check failed.')
            }
        }

        // Pick the best passing image for this event. If none pass, no image is
        // selected and all scored images remain burst items.
        const passingItems = scoredItems
            .filter(result => result.quality.passes)
            .sort((a, b) => b.quality.qualityScore - a.quality.qualityScore)

        const selectedItem = passingItems[0]?.item ?? null

        for (const { item, quality } of scoredItems) {
            if (!item.id) continue

            if (selectedItem?.id === item.id) {
                await setItemRole(item.id, FootageRole.SELECTED)
                selectedCount += 1
            } else {
                await setItemRole(item.id, FootageRole.BURST)
            }

            const qualityNote = quality.passes
                ? `Quality check passed. Score: ${quality.qualityScore.toFixed(2)}.`
                : `Quality check failed. ${quality.reason}`

            await setItemProcessed(item.id, qualityNote)
            processedCount += 1
        }
    }

    return {
        processedCount,
        selectedCount,
        failedCount,
    }
}
