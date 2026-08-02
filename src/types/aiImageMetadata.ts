export interface AiImageMetadata {
    title: string
    description: string
    tags: string[]
}

export interface AiImageMetadataDecision {
    action: 'accept' | 'reject_similar'
    metadata: AiImageMetadata | null
    similarityReason: string | null
}

export interface AiImageMetadataBatchSummary {
    processed: number
    skipped: number
    succeeded: number
    rejectedSimilar: number
    failed: number
}

export interface AiImageMetadataOptions {
    force?: boolean
    limit?: number
}

export type AiImageMetadataFailureReason =
    | 'missing_file'
    | 'api_key_missing'
    | 'api_failed'
    | 'invalid_response'
    | 'validation_failed'
    | 'save_failed'
    | 'similar_to_previous'
