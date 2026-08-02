export const config = {
    MAX_STORAGE_BYTES: 30 * 1024 * 1024 * 1024, // 30 GB
    OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    OPENAI_VISION_MODEL: 'gpt-5.6-luna',
    AI_IMAGE_METADATA_MAX_TAGS: 8,
}
