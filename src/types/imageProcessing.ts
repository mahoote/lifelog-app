import { FootageItem } from '@/types/footageItem'

export type ImageProcessingRejectionReason =
    'blurry' | 'near_duplicate' | 'missing_file' | 'unreadable_file' | 'analysis_failed'

export interface ImageQualityMetrics {
    blurScore: number
    brightnessScore: number
    contrastScore: number
    perceptualHash: string
}

export interface AnalyzedFootageItem {
    item: FootageItem
    metrics: ImageQualityMetrics
}

export interface ImageProcessingSummary {
    processed: number
    selected: number
    rejectedBlurry: number
    rejectedNearDuplicate: number
    failed: number
}
