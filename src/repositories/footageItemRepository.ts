import { db } from '@/database'
import { mapRowToFootageItem } from '@/mappers/footageMapper'
import { refreshGalleryDaySync } from '@/repositories/galleryDayRepository'
import { AiImageMetadata } from '@/types/aiImageMetadata'
import { FootageItem, FootageItemRow, FootageRole, FootageType } from '@/types/footageItem'

export async function getFootageItemById(id: string) {
    const row = await db.getFirstAsync<FootageItemRow>(
        `
            SELECT
                *
            FROM footage_item
            WHERE id = ?
        `,
        [id],
    )

    return row ? mapRowToFootageItem(row) : null
}

export async function getFootageItemsForDay(
    dayKey: string,
    type: FootageType = FootageType.PHOTO,
): Promise<FootageItem[]> {
    const rows = await db.getAllAsync<FootageItemRow>(
        `
            SELECT
                *
            FROM footage_item
            WHERE day_key = ?
              AND type = ?
            ORDER BY created_at ASC;
        `,
        [dayKey, type],
    )

    return rows.map(mapRowToFootageItem)
}

export async function getSelectedFootageItemsForDay(
    dayKey: string,
    type: FootageType = FootageType.PHOTO,
): Promise<FootageItem[]> {
    const rows = await db.getAllAsync<FootageItemRow>(
        `
            SELECT
                *
            FROM footage_item
            WHERE day_key = ?
              AND type = ?
              AND role = ?
            ORDER BY created_at ASC;
        `,
        [dayKey, type, FootageRole.SELECTED],
    )

    return rows.map(mapRowToFootageItem)
}

export async function getSelectedFootageItemsMissingAiMetadata(limit?: number): Promise<FootageItem[]> {
    const rows = await db.getAllAsync<FootageItemRow>(
        `
            SELECT
                *
            FROM footage_item
            WHERE type = ?
              AND role = ?
              AND (
                title IS NULL
                    OR TRIM(title) = ''
                    OR description IS NULL
                    OR TRIM(description) = ''
                    OR tags_json IS NULL
                    OR TRIM(tags_json) = ''
                )
            ORDER BY created_at ASC, sequence_index ASC
                ${typeof limit === 'number' ? 'LIMIT ?' : ''};
        `,
        typeof limit === 'number'
            ? [FootageType.PHOTO, FootageRole.SELECTED, limit]
            : [FootageType.PHOTO, FootageRole.SELECTED],
    )

    return rows.map(mapRowToFootageItem)
}

export async function getSelectedFootageItemsForAiMetadataRegeneration(
    limit?: number,
): Promise<FootageItem[]> {
    const rows = await db.getAllAsync<FootageItemRow>(
        `
            SELECT
                *
            FROM footage_item
            WHERE type = ?
              AND role = ?
            ORDER BY created_at ASC, sequence_index ASC
                ${typeof limit === 'number' ? 'LIMIT ?' : ''};
        `,
        typeof limit === 'number'
            ? [FootageType.PHOTO, FootageRole.SELECTED, limit]
            : [FootageType.PHOTO, FootageRole.SELECTED],
    )

    return rows.map(mapRowToFootageItem)
}

export async function getVideoFootageItemsMissingAiMetadata(limit?: number): Promise<FootageItem[]> {
    const rows = await db.getAllAsync<FootageItemRow>(
        `
            SELECT
                *
            FROM footage_item
            WHERE type = ?
              AND (
                title IS NULL
                    OR TRIM(title) = ''
                    OR description IS NULL
                    OR TRIM(description) = ''
                    OR tags_json IS NULL
                    OR TRIM(tags_json) = ''
                )
            ORDER BY created_at ASC, sequence_index ASC
                ${typeof limit === 'number' ? 'LIMIT ?' : ''};
        `,
        typeof limit === 'number' ? [FootageType.VIDEO, limit] : [FootageType.VIDEO],
    )

    return rows.map(mapRowToFootageItem)
}

export async function getVideoFootageItemsForAiMetadataRegeneration(
    limit?: number,
): Promise<FootageItem[]> {
    const rows = await db.getAllAsync<FootageItemRow>(
        `
 SELECT
 *
 FROM footage_item
 WHERE type = ?
 ORDER BY created_at ASC, sequence_index ASC
 ${typeof limit === 'number' ? 'LIMIT ?' : ''};
 `,
        typeof limit === 'number' ? [FootageType.VIDEO, limit] : [FootageType.VIDEO],
    )

    return rows.map(mapRowToFootageItem)
}

export async function getPhotoFootageItemsForCaptureEvent(
    captureEventId: string,
): Promise<FootageItem[]> {
    const rows = await db.getAllAsync<FootageItemRow>(
        `
            SELECT
                *
            FROM footage_item
            WHERE capture_event_id = ?
              AND type = ?
            ORDER BY sequence_index ASC, created_at ASC;
        `,
        [captureEventId, FootageType.PHOTO],
    )

    return rows.map(mapRowToFootageItem)
}

export async function updateFootageItemAiMetadata(
    footageItemId: string,
    metadata: AiImageMetadata,
): Promise<boolean> {
    const result = await db.runAsync(
        `
            UPDATE footage_item
            SET title = ?,
                description = ?,
                tags_json = ?
            WHERE id = ?;
        `,
        [metadata.title, metadata.description, JSON.stringify(metadata.tags), footageItemId],
    )

    return result.changes > 0
}

export async function markSelectedFootageItemAsCandidate(
    footageItemId: string,
    rejectionReason?: string,
): Promise<boolean> {
    const description = rejectionReason?.trim() ?? null

    const result = await db.runAsync(
        `
            UPDATE footage_item
            SET role = ?,
                title = NULL,
                description = COALESCE(?, description),
                tags_json = NULL
            WHERE id = ?
              AND type = ?
              AND role = ?;
        `,
        [FootageRole.CANDIDATE, description, footageItemId, FootageType.PHOTO, FootageRole.SELECTED],
    )

    return result.changes > 0
}

export async function getUnprocessedCandidateFootageItems(): Promise<FootageItem[]> {
    const rows = await db.getAllAsync<FootageItemRow>(
        `
            SELECT
                *
            FROM footage_item
            WHERE is_processed = 0
              AND type = ?
              AND role IN (?, ?)
            ORDER BY created_at ASC, sequence_index ASC;
        `,
        [FootageType.PHOTO, FootageRole.CANDIDATE, FootageRole.BURST],
    )

    return rows.map(mapRowToFootageItem)
}

export async function markFootageItemSelectedAndProcessed(footageItemId: string): Promise<boolean> {
    const result = await db.runAsync(
        `
 UPDATE footage_item
 SET role = ?,
 is_processed = 1
 WHERE id = ?
 AND type = ?
 AND role IN (?, ?)
 AND is_processed = 0;
 `,
        [
            FootageRole.SELECTED,
            footageItemId,
            FootageType.PHOTO,
            FootageRole.CANDIDATE,
            FootageRole.BURST,
        ],
    )

    return result.changes > 0
}

export async function markFootageItemProcessed(
    footageItemId: string,
    rejectionReason?: string,
): Promise<boolean> {
    const description = rejectionReason?.trim() ?? null

    const result = await db.runAsync(
        `
 UPDATE footage_item
 SET is_processed = 1,
 description = COALESCE(?, description)
 WHERE id = ?
 AND type = ?
 AND role IN (?, ?)
 AND is_processed = 0;
 `,
        [description, footageItemId, FootageType.PHOTO, FootageRole.CANDIDATE, FootageRole.BURST],
    )

    return result.changes > 0
}

export async function resetProcessedSelectedFootageItems(): Promise<number> {
    const result = await db.runAsync(
        `
 UPDATE footage_item
 SET is_processed = 0,
 role = ?,
 title = NULL,
 description = NULL,
 tags_json = NULL
 WHERE type = ?
 AND role = ?;
 `,
        [FootageRole.CANDIDATE, FootageType.PHOTO, FootageRole.SELECTED],
    )

    return result.changes
}

export function deleteFootageItemByFileUriSync(fileUri: string): boolean {
    const row = db.getFirstSync<{ day_key: string | null }>(
        `
    SELECT day_key
    FROM footage_item
    WHERE file_uri = ?
    LIMIT 1;
    `,
        [fileUri],
    )

    if (!row) {
        return false
    }

    const result = db.runSync(
        `
    DELETE FROM footage_item
    WHERE file_uri = ?;
    `,
        [fileUri],
    )

    if (result.changes <= 0) {
        return false
    }

    if (row.day_key) {
        refreshGalleryDaySync(row.day_key)
    }

    return true
}
