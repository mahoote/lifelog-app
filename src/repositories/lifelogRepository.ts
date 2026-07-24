import { db } from '@/database'
import { CaptureEvent, CaptureEventRow } from '@/types/captureEvent'
import { FootageItem, FootageItemRow } from '@/types/footageItem'

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
                        imported_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
                        footageItem.durationS,
                        new Date().toISOString(),
                    ],
                )
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

/**
 * Fetches all capture events from the database, along with their associated footage items.
 * The capture events are ordered by their start time in descending order, and the footage items
 * are ordered by their sequence index in ascending order.
 *
 * @returns An array of CaptureEvent objects, each containing its associated footage items.
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
            imported_at
        FROM footage_item
        ORDER BY capture_event_id, sequence_index ASC;
    `)

    const footageItemsByCaptureEventId = new Map<string, FootageItem[]>()

    for (const row of footageItemRows) {
        const captureEventId = row.capture_event_id

        const footageItem: FootageItem = {
            id: row.id,
            captureEventId: captureEventId,
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

        if (captureEventId) {
            const currentItems = footageItemsByCaptureEventId.get(captureEventId) ?? []
            currentItems.push(footageItem)
            footageItemsByCaptureEventId.set(captureEventId, currentItems)
        }
    }

    return captureEventRows.map(row => ({
        id: row.id,
        startedAt: row.started_at,
        endedAt: row.ended_at,
        motionState: row.motion_state,
        footageItems: footageItemsByCaptureEventId.get(row.id!) ?? [],
    }))
}
