export interface GalleryDay {
    dayKey: string
    imageCount: number
    videoCount: number
    firstItemAt: string | null
    lastItemAt: string | null
    coverImageUri: string | null
    updatedAt: string
}

export interface GalleryDayRow {
    day_key: string
    image_count: number
    video_count: number
    first_item_at: string | null
    last_item_at: string | null
    cover_image_uri: string | null
    updated_at: string
}
