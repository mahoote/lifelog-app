import { File, Paths } from 'expo-file-system'
import { config } from '@/config'
import { FootageItem } from '@/types/footage'
import { LifelogHealth } from '@/types/lifelog'
import { getLifelogApi, lifelogGet } from '@/utils/apiUtils'
import { getUsedFootageStorageBytes } from '@/utils/storageUtils'

/**
 * Fetches the current state of the lifelog api.
 */
export async function getLifelogHealth(): Promise<LifelogHealth> {
    const response = await lifelogGet('health')

    if (!response) return { ok: false, ssid: null, ip: null }

    return (await response.json()) as LifelogHealth
}

/**
 * Fetches all the pending footage from the lifelog api.
 */
export async function getLifelogFootage(): Promise<FootageItem[]> {
    const response = await lifelogGet('footage')

    if (!response) return []

    return (await response.json()) as FootageItem[]
}

/**
 * Downloads the footage file from the lifelog api by its id.
 * Stored inside private document directory on the phone.
 * @param id - The id of the footage file to download.
 * @param sizeBytes - The size of the footage file in bytes.
 *                    Used to check if there is enough free storage before downloading.
 * @return The file uri of the downloaded footage.
 */
export async function downloadFootageById(
    id: string,
    sizeBytes: number,
): Promise<{ data: string | null; continue: boolean }> {
    try {
        const usedBytes = getUsedFootageStorageBytes()

        if (usedBytes + sizeBytes > config.MAX_STORAGE_BYTES) {
            console.error(
                `Not enough storage to download footage ${id}. Used: ${usedBytes}, Size: ${sizeBytes}, Max: ${config.MAX_STORAGE_BYTES}`,
            )
            return { data: null, continue: false }
        }

        const BASE_URL = getLifelogApi()
        const url = `${BASE_URL}/footage/${id}`

        const file = new File(Paths.document, `${id}.mp4`)

        await File.downloadFileAsync(url, file)

        return { data: file.uri, continue: true }
    } catch (error) {
        console.error(`Failed to download footage ${id}:`, error)
        // "Continue" because could just be asking for non-existing footage.
        return { data: null, continue: true }
    }
}
