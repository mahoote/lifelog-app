import { db } from '@/database'
import { mapRowToFootageItem } from '@/mappers/footageMapper'
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
			WHERE id = ?
				AND type = ?
				AND role = ?;
		`,
        [
            metadata.title,
            metadata.description,
            JSON.stringify(metadata.tags),
            footageItemId,
            FootageType.PHOTO,
            FootageRole.SELECTED,
        ],
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
