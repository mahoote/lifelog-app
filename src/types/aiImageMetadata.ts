export interface AiImageMetadata {
    title: string
    description: string
    tags: string[]
}

export interface AiImageMetadataBatchSummary {
    processed: number
    skipped: number
    succeeded: number
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
