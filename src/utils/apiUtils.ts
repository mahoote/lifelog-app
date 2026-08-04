/**
 * Gets the base url for the lifelog api from the Redux connection state.
 * @returns The base url for the lifelog api.
 * @throws Error when the IP address is not set.
 */
export function getLifelogApi(): string {
    // const ipAddress = store.getState().connection.ipAddress?.trim()
    //
    // if (!ipAddress) {
    //     throw new Error('Connection IP address is not set.')
    // }

    // const url = `http://10.191.100.218:8000`

    // return url.replace(/\/$/, '')

    return `http://10.191.100.218:8000`
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
        const baseUrl = getLifelogApi()

        if (!baseUrl) {
            throw new Error('Lifelog API base URL is not set.')
        }

        const response = await fetch(`${baseUrl}/${endpoint}`, {
            signal: controller.signal,
        })

        if (!response.ok) {
            throw new Error(`${errorMessage ?? 'Failed to fetch lifelog data'}: ${response.status}`)
        }

        return response
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.warn(errorMessage ?? 'Failed to reach lifelog api', message)
        throw error
    } finally {
        clearTimeout(timeout)
    }
}
