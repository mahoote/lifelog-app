type ImageBadge = 'verified' | 'flagged' | 'processing' | 'none'

export interface MediaItem {
    id: string
    time: string
    badge: ImageBadge
    uri?: string
    overflow?: number
}

export interface ImageSectionProps {
    title: string
    items: MediaItem[]
}
