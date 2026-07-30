export type MediaTab = 'images' | 'videos'
type ImageBadge = 'verified' | 'flagged' | 'processing' | 'none'

export interface MediaItem {
    id: string
    time: string
    badge: ImageBadge
    uri?: string
    overflow?: number
}
