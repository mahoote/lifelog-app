import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { File } from 'expo-file-system'

import { saveCaptureEvent } from '@/repositories/captureEventRepository'
import { getFootageItemById } from '@/repositories/footageItemRepository'
import { ackFootageById, downloadFootageById, failFootageById } from '@/services/lifelogService'
import { AppDispatch } from '@/store/hooks'
import { CaptureEvent } from '@/types/captureEvent'

interface FootageDownloadResult {
    id: string | null
    uri: string | null
    continue: boolean
    acked: boolean
    failedReported: boolean
}

/**
 * Downloads all the capture events and their footage items.
 * Breaks if "continue" is false.
 * @param captureEvents
 * @param dispatch
 * @param addDownloadedFootage
 */
export async function downloadCaptureEventsFootage(
    captureEvents: CaptureEvent[],
    dispatch: AppDispatch,
    addDownloadedFootage: ActionCreatorWithPayload<number, 'footage/addDownloadedFootage'>,
): Promise<
    {
        captureEventId: string | null
        downloads: FootageDownloadResult[]
    }[]
> {
    const results = []

    for (const captureEvent of captureEvents) {
        const downloads = await downloadCaptureEventFootage(captureEvent)

        const validDownloads = downloads.filter(download => download.uri !== null)

        dispatch(addDownloadedFootage(validDownloads.length))

        const result = saveCaptureEvent(captureEvent, validDownloads as { id: string; uri: string }[])

        if (!result.success || result.error) {
            console.error(`Save to db success: ${result.success}, Error: ${result.error}`)
        }

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
): Promise<FootageDownloadResult[]> {
    if (!captureEvent.footageItems) {
        return []
    }

    const results: FootageDownloadResult[] = []

    for (const footageItem of captureEvent.footageItems) {
        if (!footageItem.id) {
            continue
        }

        const existingFootageItem = await getFootageItemById(footageItem.id)

        if (existingFootageItem?.fileUri) {
            const existingFile = new File(existingFootageItem.fileUri)

            if (existingFile.exists && existingFile.size > 0) {
                const acked = await ackFootageById(footageItem.id)

                results.push({
                    id: footageItem.id,
                    uri: existingFootageItem.fileUri,
                    continue: true,
                    acked,
                    failedReported: false,
                })
                continue
            }

            if (existingFile.exists) {
                console.warn(
                    `Existing footage item ${footageItem.id} points to an empty file. Deleting and retrying download.`,
                )
                existingFile.delete()
            } else {
                console.warn(
                    `Existing footage item ${footageItem.id} points to a missing file. Retrying download.`,
                )
            }
        }

        const result = await downloadFootageById(
            footageItem.id,
            footageItem.sizeBytes,
            footageItem.type,
            footageItem.fileUri,
        )

        const acked = result.uri ? await ackFootageById(footageItem.id) : false
        const failedReported = result.uri ? false : await failFootageById(footageItem.id)

        results.push({
            id: footageItem.id,
            ...result,
            acked,
            failedReported,
        })

        if (!result.continue) {
            break
        }
    }

    return results
}
