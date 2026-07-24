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
        filePath: response.file_path,
        sizeBytes: response.size_bytes,
        state: response.state,
        attempt: response.attempt,
        lastAttemptAt: response.last_attempt_at,
        lastError: response.last_error,
        durationS: response.duration_s,
        ackedAt: response.acked_at,
    }
}
