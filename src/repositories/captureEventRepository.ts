import { File } from 'expo-file-system'
import { db } from '@/database'
import { refreshGalleryDaySync } from '@/repositories/galleryDayRepository'
import { CaptureEvent } from '@/types/captureEvent'
import { getDayKey } from '@/utils/dateUtils'

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

                const file = new File(footageUri)

                if (!file.exists) {
                    console.warn(
                        `Downloaded footage item ${footageItem.id} is missing. Skipping db save.`,
                    )
                    continue
                }

                if (file.size <= 0) {
                    console.warn(
                        `Downloaded footage item ${footageItem.id} is empty. Deleting and skipping db save.`,
                    )
                    file.delete()
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
                        is_processed,
                        title,
                        description,
                        tags_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
                        footageItem.isProcessed ?? 0,
                        footageItem.title ?? null,
                        footageItem.description ?? null,
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
