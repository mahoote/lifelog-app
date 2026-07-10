import { lifelogGet } from '@/utils/api-utils'

export interface LifelogHealth {
    ok: boolean
    ssid: string | null
    ip: string | null
}

export async function getLifelogHealth(): Promise<LifelogHealth> {
    const response = await lifelogGet('health')

    return (await response.json()) as LifelogHealth
}
