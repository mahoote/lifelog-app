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

export interface FootageItem {
    id: string | null
    captureEventId: string | null
    sequenceIndex: number
    type: FootageType
    role: FootageRole
    createdAt: string
    filePath: string
    sizeBytes: number
    state: FootageState
    attempt: number
    lastAttemptAt: string | null
    lastError: string | null
    durationS: number | null
    ackedAt: string | null
}
