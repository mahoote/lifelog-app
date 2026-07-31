import { File } from 'expo-file-system'
import * as FileSystem from 'expo-file-system/legacy'
import { BorderTypes, ColorConversionCodes, DataTypes, Mat, OpenCV } from 'react-native-fast-opencv'

import { db } from '@/database'
import { mapRowToFootageItem } from '@/mappers/footageMapper'
import { rebuildGalleryDays } from '@/repositories/galleryDayRepository'
import { FootageItem, FootageItemRow, FootageRole, FootageType } from '@/types/footageItem'

/**
 * Result from the OpenCV image quality check.
 *
 * The main score is blurScore, calculated with variance of Laplacian.
 * A higher blurScore means the image is sharper.
 */
export interface ImageQualityResult {
    blurScore: number
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
    deletedInvalidCount: number
}

// Prototype threshold for variance of Laplacian. This must be tuned against
// your own lifelog images. Raise this if too many blurry images pass.
const MIN_BLUR_SCORE = 120

/**
 * Ensures the stored image path is a file URI that Expo FileSystem can read.
 */
function normaliseImageUri(fileUri: string): string {
    return fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`
}

/**
 * Checks whether a footage item points to a real non-empty local file.
 */
function isValidLocalFile(fileUri: string): boolean {
    const file = new File(normaliseImageUri(fileUri))
    return file.exists && file.size > 0
}

/**
 * Deletes local footage_item rows that point to missing or empty files.
 *
 * This protects OpenCV from receiving invalid files. It also cleans up rows
 * created before the download validation was added.
 */
async function deleteInvalidFootageRows(): Promise<number> {
    const rows = await db.getAllAsync<{ id: string; file_uri: string }>(`
        SELECT id, file_uri
        FROM footage_item
        WHERE type = 'photo';
    `)

    let deletedCount = 0

    for (const row of rows) {
        const file = new File(normaliseImageUri(row.file_uri))

        if (file.exists && file.size > 0) {
            continue
        }

        if (file.exists) {
            file.delete()
        }

        await db.runAsync(
            `
            DELETE FROM footage_item
            WHERE id = ?;
            `,
            [row.id],
        )

        deletedCount += 1
        console.warn(`Deleted invalid footage row ${row.id}`)
    }

    if (deletedCount > 0) {
        await rebuildGalleryDays()
    }

    return deletedCount
}

/**
 * Reads the first numeric value from a Mat returned by OpenCV.
 */
function getFirstMatValue(mat: Mat): number {
    const { buffer } = mat.toBuffer('float32')
    return buffer[0] ?? 0
}

/**
 * Converts a local JPEG file to raw Base64 for OpenCV decoding.
 */
async function readImageAsBase64(fileUri: string): Promise<string> {
    const imageUri = normaliseImageUri(fileUri)
    const file = new File(imageUri)
    if (!file.exists) {
        throw new Error(`Image file does not exist: ${imageUri}`)
    }

    if (file.size <= 0) {
        throw new Error(`Image file is empty: ${imageUri}`)
    }

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
    })

    if (!base64 || base64.length === 0) {
        throw new Error(`Image file produced empty Base64: ${imageUri}`)
    }

    return base64
}

/**
 * Calculates image sharpness using variance of Laplacian.
 *
 * Flow:
 * 1. Read the image file as Base64.
 * 2. Decode it into an OpenCV Mat.
 * 3. Convert it to grayscale.
 * 4. Apply the Laplacian operator.
 * 5. Calculate the standard deviation of the Laplacian result.
 * 6. Square the standard deviation to get variance.
 */
async function calculateLaplacianVariance(fileUri: string): Promise<number> {
    const base64 = await readImageAsBase64(fileUri)

    const src = Mat.createFromBase64(base64)
    const gray = Mat.create()
    const laplacian = Mat.create()
    const mean = Mat.create()
    const stddev = Mat.create()

    try {
        if (src.rows === 0 || src.cols === 0) {
            throw new Error(`OpenCV decoded an empty image. rows=${src.rows}, cols=${src.cols}`)
        }

        OpenCV.cvtColor(src, gray, ColorConversionCodes.COLOR_BGR2GRAY)
        OpenCV.Laplacian(gray, laplacian, DataTypes.CV_64F, 1, 1, 0, BorderTypes.BORDER_DEFAULT)
        OpenCV.meanStdDev(laplacian, mean, stddev)

        const standardDeviation = getFirstMatValue(stddev)
        return standardDeviation * standardDeviation
    } finally {
        src.release()
        gray.release()
        laplacian.release()
        mean.release()
        stddev.release()
    }
}

/**
 * Performs the current image quality check for one footage item.
 */
async function checkImageQuality(item: FootageItem): Promise<ImageQualityResult> {
    const blurScore = await calculateLaplacianVariance(item.fileUri)
    const passes = blurScore >= MIN_BLUR_SCORE

    return {
        blurScore,
        qualityScore: blurScore,
        passes,
        reason: passes ? null : 'Image is too blurry.',
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
 * Resets photo processing while tuning the threshold or debugging OpenCV.
 *
 * Do not call this in normal app flow.
 */
export async function resetPhotoProcessing(): Promise<void> {
    await db.runAsync(`
        UPDATE footage_item
        SET is_processed = 0,
            role = CASE
                WHEN role = 'selected' THEN 'candidate'
                ELSE role
            END
        WHERE type = 'photo';
    `)
}

/**
 * Processes every unprocessed photo in footage_item.
 *
 * Invalid local files are deleted before processing, so OpenCV only receives
 * existing non-empty files. Within each capture event, the sharpest passing
 * image is marked as selected and the rest remain burst images.
 */
export async function processUnprocessedFootageImages(): Promise<ProcessFootageResult> {
    const deletedInvalidCount = await deleteInvalidFootageRows()
    const items = await getUnprocessedPhotoItems()
    const groups = groupByCaptureEvent(items)

    let processedCount = 0
    let selectedCount = 0
    let failedCount = 0

    for (const group of groups.values()) {
        const scoredItems: { item: FootageItem; quality: ImageQualityResult }[] = []

        for (const item of group) {
            if (!item.id) continue

            if (!isValidLocalFile(item.fileUri)) {
                failedCount += 1
                await setItemRole(item.id, FootageRole.BURST)
                await setItemProcessed(item.id, 'Skipped invalid or empty image file.')
                continue
            }

            try {
                const quality = await checkImageQuality(item)
                scoredItems.push({ item, quality })
            } catch (error) {
                failedCount += 1
                console.error('OpenCV image quality check failed', {
                    id: item.id,
                    fileUri: item.fileUri,
                    error,
                })
                await setItemRole(item.id, FootageRole.BURST)
                await setItemProcessed(item.id, 'OpenCV image quality check failed.')
            }
        }

        const sortedItems = [...scoredItems].sort(
            (a, b) => b.quality.qualityScore - a.quality.qualityScore,
        )
        const bestItem = sortedItems[0] ?? null
        const selectedItem = bestItem?.quality.passes ? bestItem.item : null

        for (const { item, quality } of scoredItems) {
            if (!item.id) continue

            if (selectedItem?.id === item.id) {
                await setItemRole(item.id, FootageRole.SELECTED)
                selectedCount += 1
            } else {
                await setItemRole(item.id, FootageRole.BURST)
            }

            const qualityNote = quality.passes
                ? `Blur check passed. Laplacian variance: ${quality.blurScore.toFixed(2)}.`
                : `Blur check failed. Laplacian variance: ${quality.blurScore.toFixed(2)}.`

            await setItemProcessed(item.id, qualityNote)
            processedCount += 1
        }
    }

    return {
        processedCount,
        selectedCount,
        failedCount,
        deletedInvalidCount,
    }
}
