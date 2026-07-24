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

export enum MotionState {
    IDLE = 'idle',
    DEFAULT = 'default',
    ACTIVE = 'active',
}

export interface FootageItemResponse {
    id: string
    type: FootageType
    created_at: string
    size_bytes: number
    motion_state: MotionState
    state: FootageState
    attempt: number
    sha256: string
    duration_s: number
    capture_end_s: number
    last_error: string
}

export interface FootageItem {
    id: string
    type: FootageType
    createdAt: string
    sizeBytes: number
    motionState: MotionState
    isFavorite: boolean
    importedAt: string
    dayKey: string
    fileUri: string | null
    duration: number | null
    notes: string | null
    tags: string | null
}
