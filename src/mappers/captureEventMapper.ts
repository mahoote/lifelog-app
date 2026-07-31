import { mapResponseToFootageItem } from '@/mappers/footageMapper'
import { CaptureEvent, CaptureEventResponse } from '@/types/captureEvent'

/**
 * Maps the CaptureEventResponse from the API to the CaptureEvent used in the app.
 * @param response
 */
export function mapCaptureEvent(response: CaptureEventResponse): CaptureEvent {
    return {
        id: response.id,
        startedAt: response.started_at,
        endedAt: response.ended_at,
        motionState: response.motion_state,
        footageItems: response.footage_items?.map(mapResponseToFootageItem) ?? null,
    }
}
