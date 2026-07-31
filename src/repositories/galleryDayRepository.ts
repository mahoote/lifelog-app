import { db } from '@/database'
import { mapGalleryDayRow } from '@/mappers/galleryDayMapper'
import { GalleryDay, GalleryDayRow } from '@/types/galleryDay'

export function refreshGalleryDaySync(dayKey: string) {
    const now = new Date().toISOString()

    const counts = db.getFirstSync<{
        image_count: number
        video_count: number
        first_item_at: string | null
        last_item_at: string | null
    }>(
        `
        SELECT
            SUM(CASE WHEN type = 'photo' THEN 1 ELSE 0 END) AS image_count,
            SUM(CASE WHEN type = 'video' THEN 1 ELSE 0 END) AS video_count,
            MIN(created_at) AS first_item_at,
            MAX(created_at) AS last_item_at
        FROM footage_item
        WHERE day_key = ?;
        `,
        [dayKey],
    )

    const cover = db.getFirstSync<{ file_uri: string }>(
        `
        SELECT file_uri
        FROM footage_item
        WHERE day_key = ?
          AND type = 'photo'
        ORDER BY created_at ASC
        LIMIT 1;
        `,
        [dayKey],
    )

    const imageCount = counts?.image_count ?? 0
    const videoCount = counts?.video_count ?? 0
    const totalCount = imageCount + videoCount

    if (totalCount === 0) {
        db.runSync(
            `
            DELETE FROM gallery_day
            WHERE day_key = ?;
            `,
            [dayKey],
        )

        return
    }

    db.runSync(
        `
        INSERT INTO gallery_day (
            day_key,
            image_count,
            video_count,
            first_item_at,
            last_item_at,
            cover_image_uri,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(day_key) DO UPDATE SET
            image_count = excluded.image_count,
            video_count = excluded.video_count,
            first_item_at = excluded.first_item_at,
            last_item_at = excluded.last_item_at,
            cover_image_uri = excluded.cover_image_uri,
            updated_at = excluded.updated_at;
        `,
        [
            dayKey,
            imageCount,
            videoCount,
            counts?.first_item_at ?? null,
            counts?.last_item_at ?? null,
            cover?.file_uri ?? null,
            now,
        ],
    )
}

export async function getGalleryDays(): Promise<GalleryDay[]> {
    const rows = await db.getAllAsync<GalleryDayRow>(`
        SELECT
            day_key,
            image_count,
            video_count,
            first_item_at,
            last_item_at,
            cover_image_uri,
            updated_at
        FROM gallery_day
        ORDER BY day_key DESC;
    `)

    return rows.map(mapGalleryDayRow)
}

export async function getLatestGalleryDay(): Promise<GalleryDay | null> {
    const row = await db.getFirstAsync<GalleryDayRow>(`
        SELECT
            day_key,
            image_count,
            video_count,
            first_item_at,
            last_item_at,
            cover_image_uri,
            updated_at
        FROM gallery_day
        ORDER BY day_key DESC
        LIMIT 1;
    `)

    return row ? mapGalleryDayRow(row) : null
}

export async function rebuildGalleryDays(): Promise<void> {
    const rows = await db.getAllAsync<{ day_key: string }>(`
        SELECT DISTINCT day_key
        FROM footage_item
        WHERE day_key IS NOT NULL
        ORDER BY day_key DESC;
    `)

    db.withTransactionSync(() => {
        db.runSync(`DELETE FROM gallery_day;`)

        for (const row of rows) {
            refreshGalleryDaySync(row.day_key)
        }
    })
}
export async function deleteAllLifelogDataAndVacuum(): Promise<{
    success: boolean
    error: Error | null
}> {
    try {
        await db.withTransactionAsync(async () => {
            await db.runAsync(`DELETE FROM footage_item;`)
            await db.runAsync(`DELETE FROM capture_event;`)
            await db.runAsync(`DELETE FROM gallery_day;`)
        })

        await db.execAsync(`VACUUM;`)

        return {
            success: true,
            error: null,
        }
    } catch (error) {
        console.error('Failed to delete lifelog data', error)

        return {
            success: false,
            error: error as Error,
        }
    }
}
