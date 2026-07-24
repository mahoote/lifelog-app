import { downloadFootageById } from '@/services/lifelogService'
import { CaptureEvent } from '@/types/captureEvent'

/**
 * Downloads all the capture events and their footage items.
 * Breaks if "continue" is false.
 * @param captureEvents
 */
export async function downloadCaptureEventsFootage(captureEvents: CaptureEvent[]): Promise<
    {
        captureEventId: string | null
        downloads: { id: string | null; data: string | null; continue: boolean }[]
    }[]
> {
    const results = []

    for (const captureEvent of captureEvents) {
        const downloads = await downloadCaptureEventFootage(captureEvent)

        results.push({
            captureEventId: captureEvent.id,
            downloads,
        })

        const shouldContinue = downloads.every(download => download.continue)

        if (!shouldContinue) {
            break
        }
    }

    return results
}

/**
 * Downloads all the footage items within a capture event.
 * Breaks if "continue" is false.
 * @param captureEvent
 */
export async function downloadCaptureEventFootage(
    captureEvent: CaptureEvent,
): Promise<{ id: string | null; data: string | null; continue: boolean }[]> {
    if (!captureEvent.footageItems) {
        return []
    }

    const results = []

    for (const footageItem of captureEvent.footageItems) {
        if (!footageItem.id) {
            continue
        }

        const result = await downloadFootageById(
            footageItem.id,
            footageItem.sizeBytes,
            footageItem.type,
            footageItem.filePath,
        )

        results.push({
            id: footageItem.id,
            ...result,
        })

        if (!result.continue) {
            break
        }
    }

    return results
}
