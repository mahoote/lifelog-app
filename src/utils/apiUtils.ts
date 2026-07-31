import { store } from '@/store/store'

/**
 * Gets the base url from the .env file for the lifelog api
 * @returns {string | null} The base url for the lifelog api
 */
export function getLifelogApi(): string | null {
    const ipAddress = store.getState().connection.ipAddress

    if (!ipAddress) {
        console.error('Connection IP address is not set')
        return null
    }

    const url = `http://${ipAddress}:8000`

    if (!url) {
        console.error('EXPO_PUBLIC_LIFELOG_API_BASE_URL is not set')
        return null
    }

    return url.replace(/\/$/, '')
}

/**
 * A generalised function for fetching a GET endpoint for the lifelog api.
 * @param endpoint
 * @param timeoutMs
 * @param errorMessage
 */
export async function lifelogGet(
    endpoint: string,
    timeoutMs = 10_000,
    errorMessage?: string,
): Promise<Response | null> {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
        console.warn(`Lifelog API request timed out after ${timeoutMs}ms: ${endpoint}`)
        controller.abort()
    }, timeoutMs)

    try {
        const response = await fetch(`${getLifelogApi()}/${endpoint}`, {
            signal: controller.signal,
        })

        if (!response.ok) {
            console.error(`${errorMessage ?? 'Failed to fetch lifelog data'}: ${response.status}`)

            return null
        }

        return response
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)

        console.warn(errorMessage ?? 'Failed to reach lifelog api', message)

        return null
    } finally {
        clearTimeout(timeout)
    }
}
