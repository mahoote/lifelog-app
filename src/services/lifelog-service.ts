export interface LifelogHealth {
    ok: boolean
    ssid: string | null
    ip: string | null
}

function getLifelogApi() {
    const url = process.env.EXPO_PUBLIC_LIFELOG_API_BASE_URL

    if (!url) {
        throw new Error('EXPO_PUBLIC_LIFELOG_API_BASE_URL is not set')
    }

    return url.replace(/\/$/, '')
}

const LIFELOG_API = getLifelogApi()

export async function getLifelogHealth(): Promise<LifelogHealth> {
    const response = await fetch(`${LIFELOG_API}/health`)

    if (!response.ok) {
        throw new Error(`Failed to fetch lifelog health: ${response.status}`)
    }

    return (await response.json()) as LifelogHealth
}
