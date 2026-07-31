import { DiaryEntry } from '@/types/diary'
import { FootageItem, FootageItemResponse, FootageItemRow } from '@/types/footageItem'
import { formatDate, formatDiaryDatetime } from '@/utils/dateUtils'

/**
 * Maps the FootageItemResponse from the API to the FootageItem used in the app.
 * @param response
 */
export function mapResponseToFootageItem(response: FootageItemResponse): FootageItem {
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
export function mapRowToFootageItem(row: FootageItemRow): FootageItem {
    return {
        id: row.id,
        captureEventId: row.capture_event_id,
        sequenceIndex: row.sequence_index,
        type: row.type,
        role: row.role,
        createdAt: row.created_at,
        fileUri: row.file_uri,
        sizeBytes: row.size_bytes,
        state: row.state,
        durationS: row.duration_s,
        importedAt: row.imported_at,
        dayKey: row.day_key,
        isFavorite: row.is_favorite === 1,
        notes: row.notes,
        tagsJson: row.tags_json,
    }
}
export function mapFootageItemToDiaryEntry(item: FootageItem): DiaryEntry {
    return {
        id: item.id ?? `${item.createdAt}-${item.sequenceIndex}`,
        title: formatDate(new Date(item.createdAt)),
        caption: item.notes ?? 'Selected memory from this day.',
        uri: item.fileUri,
        datetime: formatDiaryDatetime(item.createdAt),
    }
}
