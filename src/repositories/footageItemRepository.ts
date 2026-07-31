import { db } from '@/database'
import { mapRowToFootageItem } from '@/mappers/footageMapper'
import { FootageItem, FootageItemRow, FootageType } from '@/types/footageItem'

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
            notes,
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
            notes,
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
