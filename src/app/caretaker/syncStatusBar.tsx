import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { colors } from '@/constants/colors'
import { getLifelogPendingFootage } from '@/services/lifelogService'
import { footageActions } from '@/store/footageSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { downloadCaptureEventsFootage } from '@/utils/downloadUtils'

export default function SyncStatusBar() {
    const dispatch = useAppDispatch()

    const pendingFootage = useAppSelector(state => state.footage.pendingFootage)
    const downloadedFootage = useAppSelector(state => state.footage.downloadedFootage)

    const [processLoading, setProcessLoading] = useState<boolean>(false)

    /**
     * Downloads all pending footage from the lifelog api.
     * Calculates the total pending footage items and updates the downloadedFootage state
     * for every downloaded captureEvent.
     */
    const handleDownloadFootage = async () => {
        setProcessLoading(true)

        const captureEvents = await getLifelogPendingFootage()

        if (captureEvents.length) {
            const pendingFootageCount = captureEvents.reduce(
                (total, event) => total + (event.footageItems?.length ?? 0),
                0,
            )

            dispatch(footageActions.setPendingFootage(pendingFootageCount))
            dispatch(footageActions.setDownloadedFootage(0))

            const downloaded = await downloadCaptureEventsFootage(
                captureEvents,
                dispatch,
                footageActions.addDownloadedFootage,
            )
            console.info(`Downloaded ${downloaded.length} capture events and their footage.`)
        }

        setProcessLoading(false)
    }

    if (!pendingFootage) return null

    return (
        <View className="flex-row items-center justify-between rounded-full bg-primary-fixed px-5 py-4">
            <View className="flex-row items-center gap-3">
                <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                <View>
                    <Text className="font-atkinson-bold text-[16px] leading-[20px] text-on-primary-fixed">
                        {pendingFootage} New Items
                    </Text>
                    <Text className="font-atkinson text-[14px] leading-[18px] text-on-primary-fixed-variant">
                        Processed: {downloadedFootage}
                    </Text>
                </View>
            </View>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Process new items"
                className="h-11 flex-row items-center justify-center gap-2 rounded-full bg-primary px-5 active:bg-on-primary-container"
                disabled={processLoading}
                onPress={() => void handleDownloadFootage()}
            >
                <FontAwesomeIcon icon={faWandMagicSparkles} size={14} color={colors.onPrimary} />
                <Text className="font-atkinson-bold text-[16px] text-on-primary">
                    {processLoading ? 'Processing...' : 'Process'}
                </Text>
            </Pressable>
        </View>
    )
}
