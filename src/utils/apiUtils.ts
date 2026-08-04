import { store } from '@/store/store'

/**
 * Gets the base url for the lifelog api from the Redux connection state.
 * @returns The base url for the lifelog api.
 * @throws Error when the IP address is not set.
 */
export function getLifelogApi(): string {
    const ipAddress = store.getState().connection.ipAddress?.trim()

    if (!ipAddress) {
        throw new Error('Connection IP address is not set.')
    }

    const url = `http://${ipAddress}:8000`

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
): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
        controller.abort()
    }, timeoutMs)

    try {
        const baseUrl = getLifelogApi()
        const response = await fetch(`${baseUrl}/${endpoint}`, {
            signal: controller.signal,
        })

        if (!response.ok) {
            throw new Error(
                `${errorMessage ?? 'Failed to fetch lifelog data'}. Status: ${response.status}, url: ${baseUrl}/${endpoint}`,
            )
        }

        return response
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error(`Lifelog API request timed out after ${timeoutMs}ms: ${endpoint}`)
            }

            throw new Error(errorMessage ?? error.message)
        }

        throw new Error(errorMessage ?? 'Failed to reach lifelog api.')
    } finally {
        clearTimeout(timeout)
    }
}
