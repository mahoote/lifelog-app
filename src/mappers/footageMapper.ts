import { FootageItem, FootageItemResponse } from '@/types/footage'

/**
 * Maps the FootageItemResponse from the API to the FootageItem used in the app.
 * @param footage
 */
export function mapFootageItem(footage: FootageItemResponse): FootageItem {
    return {
        id: footage.id,
        type: footage.type,
        createdAt: footage.created_at,
        sizeBytes: footage.size_bytes,
        motionState: footage.motion_state,
        importedAt: new Date().toISOString(),
        dayKey: footage.created_at.split('T')[0],
        duration: footage.duration_s,
        isFavorite: false,
        filePath: null,
        notes: null,
        tags: null,
    }
}
