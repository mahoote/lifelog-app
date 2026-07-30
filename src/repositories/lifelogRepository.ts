import { db } from '@/database'
import { CaptureEvent, CaptureEventRow } from '@/types/captureEvent'
import { FootageItem, FootageItemRow } from '@/types/footageItem'

export interface GalleryDay {
    dayKey: string
    imageCount: number
    videoCount: number
    firstItemAt: string | null
    lastItemAt: string | null
    coverImageUri: string | null
    updatedAt: string
}

export interface GalleryDayRow {
    day_key: string
    image_count: number
    video_count: number
    first_item_at: string | null
    last_item_at: string | null
    cover_image_uri: string | null
    updated_at: string
}

export interface GalleryImage {
    id: string
    captureEventId: string
    sequenceIndex: number
    type: string
    role: string
    createdAt: string
    fileUri: string
    sizeBytes: number
    state: string
    durationS: number | null
    importedAt: string
    dayKey: string
    isFavorite: boolean
    notes: string | null
    tagsJson: string | null
}

export interface GalleryImageRow {
    id: string
    capture_event_id: string
    sequence_index: number
    type: string
    role: string
    created_at: string
    file_uri: string
    size_bytes: number
    state: string
    duration_s: number | null
    imported_at: string
    day_key: string
    is_favorite: number
    notes: string | null
    tags_json: string | null
}

function getDayKey(isoDate: string): string {
    return isoDate.slice(0, 10)
}

function mapGalleryImageRow(row: GalleryImageRow): GalleryImage {
    return {
        id: row.id,
        captureEventId: row.capture_event_id,
        sequenceIndex: row.sequence_index,
        type: row.type,
        role: row.role,
        createdAt: row.created_at,
        fileUri: row.file_uri,
        sizeBytes: row.size_bytes,
        state: row.state,
        durationS: row.duration_s,
        importedAt: row.imported_at,
        dayKey: row.day_key,
        isFavorite: row.is_favorite === 1,
        notes: row.notes,
        tagsJson: row.tags_json,
    }
}

function mapGalleryDayRow(row: GalleryDayRow): GalleryDay {
    return {
        dayKey: row.day_key,
        imageCount: row.image_count,
        videoCount: row.video_count,
        firstItemAt: row.first_item_at,
        lastItemAt: row.last_item_at,
        coverImageUri: row.cover_image_uri,
        updatedAt: row.updated_at,
    }
}

function refreshGalleryDaySync(dayKey: string) {
    const now = new Date().toISOString()

    const counts = db.getFirstSync<{
        image_count: number
        video_count: number
        first_item_at: string | null
        last_item_at: string | null
    }>(
        `
        SELECT
            SUM(CASE WHEN type = 'image' THEN 1 ELSE 0 END) AS image_count,
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
          AND type = 'image'
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

export function saveCaptureEvent(
    captureEvent: CaptureEvent,
    downloads: { id: string; uri: string }[],
): { success: boolean; error: Error | null } {
    try {
        if (!captureEvent.id) {
            return {
                success: false,
                error: new Error('Cannot save capture event without id'),
            }
        }

        const changedDayKeys = new Set<string>()
        const importedAt = new Date().toISOString()

        db.withTransactionSync(() => {
            db.runSync(
                `
                INSERT OR REPLACE INTO capture_event (
                    id,
                    started_at,
                    ended_at,
                    motion_state
                ) VALUES (?, ?, ?, ?);
                `,
                [
                    captureEvent.id,
                    captureEvent.startedAt,
                    captureEvent.endedAt,
                    captureEvent.motionState,
                ],
            )

            for (const footageItem of captureEvent.footageItems ?? []) {
                if (!footageItem.id) {
                    continue
                }

                const footageUri = downloads.find(download => download.id === footageItem.id)?.uri

                if (!footageUri) {
                    console.warn(`Footage item ${footageItem.id} not found in downloads. Skipping.`)
                    continue
                }

                const dayKey = getDayKey(footageItem.createdAt)
                changedDayKeys.add(dayKey)

                db.runSync(
                    `
                    INSERT OR REPLACE INTO footage_item (
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
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                    `,
                    [
                        footageItem.id,
                        captureEvent.id,
                        footageItem.sequenceIndex,
                        footageItem.type,
                        footageItem.role,
                        footageItem.createdAt,
                        footageUri,
                        footageItem.sizeBytes,
                        footageItem.state,
                        footageItem.durationS ?? null,
                        importedAt,
                        dayKey,
                        footageItem.isFavorite ?? 0,
                        footageItem.notes ?? null,
                        footageItem.tagsJson ?? null,
                    ],
                )
            }

            for (const dayKey of changedDayKeys) {
                refreshGalleryDaySync(dayKey)
            }
        })

        return {
            success: true,
            error: null,
        }
    } catch (error) {
        console.error('Failed to save capture event', error)

        return {
            success: false,
            error: error as Error,
        }
    }
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

export async function getGalleryImagesForDay(dayKey: string): Promise<GalleryImage[]> {
    const rows = await db.getAllAsync<GalleryImageRow>(
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
          AND type = 'image'
        ORDER BY created_at ASC;
        `,
        [dayKey],
    )

    return rows.map(mapGalleryImageRow)
}

export async function getGalleryVideosForDay(dayKey: string): Promise<GalleryImage[]> {
    const rows = await db.getAllAsync<GalleryImageRow>(
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
          AND type = 'video'
        ORDER BY created_at ASC;
        `,
        [dayKey],
    )

    return rows.map(mapGalleryImageRow)
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

export async function deleteFootageItem(id: string): Promise<void> {
    const existing = await db.getFirstAsync<{ day_key: string }>(
        `
        SELECT day_key
        FROM footage_item
        WHERE id = ?;
        `,
        [id],
    )

    await db.runAsync(
        `
        DELETE FROM footage_item
        WHERE id = ?;
        `,
        [id],
    )

    if (existing?.day_key) {
        refreshGalleryDaySync(existing.day_key)
    }
}

export async function toggleFavoriteFootageItem(id: string, isFavorite: boolean): Promise<void> {
    await db.runAsync(
        `
        UPDATE footage_item
        SET is_favorite = ?
        WHERE id = ?;
        `,
        [isFavorite ? 1 : 0, id],
    )
}

/**
 * Keep this for debugging or for screens that genuinely need capture events.
 * Do not use this for the gallery grid.
 */
export function getCaptureEvents(): CaptureEvent[] {
    const captureEventRows = db.getAllSync<CaptureEventRow>(`
        SELECT
            id,
            started_at,
            ended_at,
            motion_state
        FROM capture_event
        ORDER BY started_at DESC;
    `)

    const footageItemRows = db.getAllSync<FootageItemRow>(`
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
        ORDER BY capture_event_id, sequence_index ASC;
    `)

    const footageItemsByCaptureEventId = new Map<string, FootageItem[]>()

    for (const row of footageItemRows) {
        const captureEventId = row.capture_event_id

        const footageItem: FootageItem = {
            id: row.id,
            captureEventId,
            sequenceIndex: row.sequence_index,
            type: row.type,
            role: row.role,
            createdAt: row.created_at,
            fileUri: row.file_uri,
            sizeBytes: row.size_bytes,
            state: row.state,
            durationS: row.duration_s,
            importedAt: row.imported_at,
            dayKey: row.day_key,
            isFavorite: row.is_favorite,
            notes: row.notes,
            tagsJson: row.tags_json,
        }

        const currentItems = footageItemsByCaptureEventId.get(captureEventId!) ?? []
        currentItems.push(footageItem)
        footageItemsByCaptureEventId.set(captureEventId!, currentItems)
    }

    return captureEventRows.map(row => ({
        id: row.id,
        startedAt: row.started_at,
        endedAt: row.ended_at,
        motionState: row.motion_state,
        footageItems: footageItemsByCaptureEventId.get(row.id!) ?? [],
    }))
}
