import { GalleryDay, GalleryDayRow } from '@/types/galleryDay'

export function mapGalleryDayRow(row: GalleryDayRow): GalleryDay {
    return {
        dayKey: row.day_key,
        imageCount: row.image_count,
        videoCount: row.video_count,
        firstItemAt: row.first_item_at,
        lastItemAt: row.last_item_at,
        coverImageUri: row.cover_image_uri,
        updatedAt: row.updated_at,
    }
}
