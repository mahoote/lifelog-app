import { FootageItem, FootageItemResponse } from '@/types/footageItem'

export enum MotionState {
    IDLE = 'idle',
    DEFAULT = 'default',
    ACTIVE = 'active',
}

export interface CaptureEventResponse {
    id: string | null
    started_at: string
    ended_at: string
    motion_state: MotionState
    footage_items: FootageItemResponse[] | null
}

export interface CaptureEventRow {
    id: string | null
    started_at: string
    ended_at: string
    motion_state: MotionState
}

export interface CaptureEvent {
    id: string | null
    startedAt: string
    endedAt: string
    motionState: MotionState
    footageItems: FootageItem[] | null
}
