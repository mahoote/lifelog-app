/**
 * Gets the base url from the .env file for the lifelog api
 * @returns {string | null} The base url for the lifelog api
 */
export function getLifelogApi(): string | null {
    const url = process.env.EXPO_PUBLIC_LIFELOG_API_BASE_URL

    if (!url) {
        console.error('EXPO_PUBLIC_LIFELOG_API_BASE_URL is not set')
        return null
    }

    return url.replace(/\/$/, '')
}

/**
 * A generalised function for fetching a GET endpoint for the lifelog api.
 * @param endpoint
 * @param errorMessage
 */
export async function lifelogGet(endpoint: string, errorMessage?: string): Promise<Response | null> {
    try {
        const response = await fetch(`${getLifelogApi()}/${endpoint}`)

        if (!response.ok) {
            console.error(`${errorMessage ?? 'Failed to fetch lifelog data'}: ${response.status}`)

            return null
        }

        return response
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.warn(errorMessage ?? 'Failed to reach lifelog api', message)

        return null
    }
}
