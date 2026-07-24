import { FootageItem, FootageItemResponse } from '@/types/footageItem'

/**
 * Maps the FootageItemResponse from the API to the FootageItem used in the app.
 * @param response
 */
export function mapFootageItem(response: FootageItemResponse): FootageItem {
    return {
        id: response.id,
        captureEventId: response.capture_event_id,
        sequenceIndex: response.sequence_index,
        type: response.type,
        role: response.role,
        createdAt: response.created_at,
        fileUri: response.file_path,
        sizeBytes: response.size_bytes,
        state: response.state,
        durationS: response.duration_s,

        importedAt: null,
        dayKey: null,
        isFavorite: false,
        notes: null,
        tagsJson: null,
    }
}
