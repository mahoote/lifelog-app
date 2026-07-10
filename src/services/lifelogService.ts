import { File, Paths } from 'expo-file-system'
import { FootageItem } from '@/types/footage'
import { LifelogHealth } from '@/types/lifelog'
import { getLifelogApi, lifelogGet } from '@/utils/apiUtils'

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
 * @param id
 * @return The file uri of the downloaded footage.
 */
export async function downloadFootageById(id: string): Promise<string | null> {
    try {
        const BASE_URL = getLifelogApi()
        const url = `${BASE_URL}/footage/${id}`

        const file = new File(Paths.document, `${id}.mp4`)

        await File.downloadFileAsync(url, file)

        return file.uri
    } catch (error) {
        console.error(`Failed to download footage ${id}:`, error)
        return null
    }
}
