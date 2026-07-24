import { db } from '@/database'
import { CaptureEvent } from '@/types/captureEvent'

export function saveCaptureEvent(captureEvent: CaptureEvent) {
    try {
        if (!captureEvent.id) {
            throw new Error('Cannot save capture event without id')
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
                        acked_at,
                        imported_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                    `,
                    [
                        footageItem.id,
                        captureEvent.id,
                        footageItem.sequenceIndex,
                        footageItem.type,
                        footageItem.role,
                        footageItem.createdAt,
                        footageItem.filePath,
                        footageItem.sizeBytes,
                        footageItem.state,
                        footageItem.durationS,
                        footageItem.ackedAt,
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
            error,
        }
    }
}
