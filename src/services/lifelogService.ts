import { LifelogHealth } from '@/types/lifelog'
import { lifelogGet } from '@/utils/apiUtils'

export async function getLifelogHealth(): Promise<LifelogHealth> {
    const response = await lifelogGet('health')

    if (!response) return { ok: false, ssid: null, ip: null }

    return (await response.json()) as LifelogHealth
}
