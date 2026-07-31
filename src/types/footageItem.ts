export enum FootageType {
    PHOTO = 'photo',
    VIDEO = 'video',
}

export enum FootageState {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    ACKED = 'acked',
    FAILED = 'failed',
}

export enum FootageRole {
    BURST = 'burst',
    CANDIDATE = 'candidate',
    CONTEXT = 'context',
    SELECTED = 'selected',
}

export interface FootageItemResponse {
    id: string | null
    capture_event_id: string | null
    sequence_index: number
    type: FootageType
    role: FootageRole
    created_at: string
    file_path: string
    size_bytes: number
    state: FootageState
    attempt: number
    last_attempt_at: string | null
    last_error: string | null
    duration_s: number | null
    acked_at: string | null
}

export interface FootageItemRow {
    id: string | null
    capture_event_id: string | null
    sequence_index: number
    type: FootageType
    role: FootageRole
    created_at: string
    file_uri: string
    size_bytes: number
    state: FootageState
    duration_s: number | null
    imported_at: string | null
    day_key: string | null
    is_favorite: number
    notes: string | null
    tags_json: string | null
    is_processed: number
}

export interface FootageItem {
    id: string | null
    captureEventId: string | null
    sequenceIndex: number
    type: FootageType
    role: FootageRole
    createdAt: string
    fileUri: string
    sizeBytes: number
    state: FootageState
    durationS: number | null
    importedAt: string | null
    dayKey: string | null
    isFavorite: boolean
    notes: string | null
    tagsJson: string | null
    isProcessed: boolean
}
