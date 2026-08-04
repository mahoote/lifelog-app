import { Directory, File, Paths } from 'expo-file-system'

import { config } from '@/config/config'
import { mapCaptureEvent } from '@/mappers/captureEventMapper'
import { CaptureEvent, CaptureEventResponse } from '@/types/captureEvent'
import { FootageType } from '@/types/footageItem'
import { LifelogHealth } from '@/types/lifelog'
import { getLifelogApi, lifelogGet } from '@/utils/apiUtils'
import { makeRoomForFootageDownload } from '@/utils/storageUtils'

/**
 * Fetches the current state of the lifelog api.
 */
export async function getLifelogHealth(): Promise<LifelogHealth | null> {
    const response = await lifelogGet('health', 5_000)

    if (!response) return null

    return (await response.json()) as LifelogHealth
}

/**
 * Fetches all the pending footage from the lifelog api.
 * Receives the CaptureEventResponse and maps it to the CaptureEvent used in the app.
 * @return An array of CaptureEvent objects.
 */
export async function getLifelogPendingFootage(): Promise<CaptureEvent[]> {
    const response = await lifelogGet('footage')

    if (!response) return []

    const captureEvents = (await response.json()) as CaptureEventResponse[]

    return captureEvents.map(mapCaptureEvent)
}

/**
 * Acknowledges that a footage file has been successfully downloaded.
 * @param fileId - The footage file id to acknowledge.
 * @return True when the ack endpoint succeeds.
 */
export async function ackFootageById(fileId: string): Promise<boolean> {
    const BASE_URL = getLifelogApi()

    if (!BASE_URL) {
        console.error(`Cannot ack footage ${fileId}. Lifelog API base URL is not set.`)
        return false
    }

    try {
        const response = await fetch(`${BASE_URL}/ack`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                file_id: fileId,
            }),
        })

        if (!response.ok) {
            console.error(`Failed to ack footage ${fileId}: ${response.status}`)
            return false
        }

        return true
    } catch (error) {
        console.error(`Failed to ack footage ${fileId}:`, error)
        return false
    }
}

/**
 * Reports that a footage file failed to download.
 * @param fileId - The footage file id to report as failed.
 * @return True when the failed endpoint succeeds.
 */
export async function failFootageById(fileId: string): Promise<boolean> {
    const BASE_URL = getLifelogApi()

    if (!BASE_URL) {
        console.error(`Cannot report failed footage ${fileId}. Lifelog API base URL is not set.`)
        return false
    }

    try {
        const response = await fetch(`${BASE_URL}/failed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                file_id: fileId,
            }),
        })

        if (!response.ok) {
            console.error(`Failed to report failed footage ${fileId}: ${response.status}`)
            return false
        }

        return true
    } catch (error) {
        console.error(`Failed to report failed footage ${fileId}:`, error)
        return false
    }
}

/**
 * Downloads the footage file from the lifelog api by its id.
 * Stored inside private document directory on the phone.
 * If the file is a video, it's stored within the "videos" folder.
 * @param id - The id of the footage file to download.
 * @param sizeBytes - The size of the footage file in bytes.
 * Used to check if there is enough free storage before downloading.
 * @param type - Video or photo footage type. Used to determine the folder location.
 * @param filePath - Uses the original filename to save the new file.
 * @return The file uri of the downloaded footage.
 */
export async function downloadFootageById(
    id: string,
    sizeBytes: number,
    type: FootageType,
    filePath: string,
): Promise<{ uri: string | null; continue: boolean }> {
    try {
        const hasRoomForDownload = makeRoomForFootageDownload(sizeBytes, config.MAX_STORAGE_BYTES)

        if (!hasRoomForDownload) {
            console.error(`Not enough storage to download footage ${id}.`)

            return { uri: null, continue: false }
        }

        const BASE_URL = getLifelogApi()

        if (!BASE_URL) {
            return { uri: null, continue: false }
        }

        const url = `${BASE_URL}/footage/${id}`

        const originalFileName = filePath.split('/').pop() ?? id
        const directory =
            type === FootageType.VIDEO
                ? new Directory(Paths.document, 'videos')
                : new Directory(Paths.document, 'images')

        if (!directory.exists) {
            directory.create()
        }

        const file = new File(directory, originalFileName)

        if (file.exists) {
            if (file.size > 0) {
                console.info(`Footage ${id} already exists at ${file.uri}. Skipping download.`)
                return { uri: file.uri, continue: true }
            }

            console.warn(`Footage ${id} exists but is empty. Deleting and retrying download.`)
            file.delete()
        }

        await File.downloadFileAsync(url, file)

        if (!file.exists) {
            console.warn(`Downloaded footage ${id}, but the file does not exist at ${file.uri}.`)
            return { uri: null, continue: true }
        }

        if (file.size <= 0) {
            console.warn(`Downloaded footage ${id}, but the file is empty. Discarding.`)
            file.delete()
            return { uri: null, continue: true }
        }

        return { uri: file.uri, continue: true }
    } catch (error) {
        console.error(`Failed to download footage ${id}:`, error)

        return { uri: null, continue: false }
    }
}
