import { db } from '@/database'
import { mapRowToFootageItem } from '@/mappers/footageMapper'
import { refreshGalleryDaySync } from '@/repositories/galleryDayRepository'
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
            title,
            description,
            tags_json
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
            title,
            description,
            tags_json
        FROM footage_item
        WHERE day_key = ?
          AND type = ?
          AND role = 'selected'
        ORDER BY created_at ASC;
        `,
        [dayKey, type],
    )

    return rows.map(mapRowToFootageItem)
}

export interface AiApprovedPhotoMetadata {
    title: string
    description: string
    tags: string[]
}

function normaliseTags(tags: string[]): string[] {
    return Array.from(new Set(tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)))
}

export async function markPhotoAsAiSelected(
    footageItemId: string,
    metadata: AiApprovedPhotoMetadata,
): Promise<boolean> {
    const title = metadata.title.trim()
    const description = metadata.description.trim()
    const tags = normaliseTags(metadata.tags)

    if (!title) {
        throw new Error('AI selected photo requires a title')
    }

    if (!description) {
        throw new Error('AI selected photo requires a description')
    }

    const result = await db.runAsync(
        `
        UPDATE footage_item
        SET role = ?,
            title = ?,
            description = ?,
            tags_json = ?,
            is_processed = 1
        WHERE id = ?
          AND type = ?
          AND role IN (?, ?);
        `,
        [
            FootageRole.SELECTED,
            title,
            description,
            JSON.stringify(tags),
            footageItemId,
            FootageType.PHOTO,
            FootageRole.CANDIDATE,
            FootageRole.BURST,
        ],
    )

    if (result.changes > 0) {
        const row = await db.getFirstAsync<{ day_key: string | null }>(
            `SELECT day_key FROM footage_item WHERE id = ?;`,
            [footageItemId],
        )

        if (row?.day_key) {
            refreshGalleryDaySync(row.day_key)
        }
    }

    return result.changes > 0
}

export async function markPhotoAsAiRejected(
    footageItemId: string,
    rejectionReason: string,
): Promise<boolean> {
    const result = await db.runAsync(
        `
        UPDATE footage_item
        SET is_processed = 1,
            description = ?
        WHERE id = ?
          AND type = ?
          AND role IN (?, ?);
        `,
        [rejectionReason, footageItemId, FootageType.PHOTO, FootageRole.CANDIDATE, FootageRole.BURST],
    )

    return result.changes > 0
}
