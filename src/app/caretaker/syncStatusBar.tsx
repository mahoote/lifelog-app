import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

import { colors } from '@/constants/colors'
import {
    generateAiMetadataForSelectedFootageItems,
    generateAiMetadataForVideoFootageItems,
} from '@/services/aiImageMetadataService'
import { processUnprocessedFootageItems } from '@/services/footageProcessingService'
import { getLifelogPendingFootage } from '@/services/lifelogService'
import { footageActions } from '@/store/footageSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { downloadCaptureEventsFootage } from '@/utils/downloadUtils'
import { invalidateQueries } from '@/utils/queryUtils'

type SyncStep =
    'idle' | 'fetching' | 'downloading' | 'processing' | 'imageMetadata' | 'videoMetadata' | 'refreshing'

export default function SyncStatusBar() {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const pendingFootage = useAppSelector(state => state.footage.pendingFootage)
    const downloadedFootage = useAppSelector(state => state.footage.downloadedFootage)

    const [processLoading, setProcessLoading] = useState(false)
    const [syncStep, setSyncStep] = useState<SyncStep>('idle')

    const isDownloading = syncStep === 'downloading'

    const handleDownloadFootage = async () => {
        if (processLoading) {
            return
        }

        const startedAt = Date.now()

        setProcessLoading(true)

        let captureEventCount = 0
        let pendingFootageCount = 0
        let downloadedCount = 0
        let failedDownloadCount = 0
        let ackedCount = 0
        let failedReportedCount = 0

        try {
            setSyncStep('fetching')

            const captureEvents = await getLifelogPendingFootage()
            captureEventCount = captureEvents.length

            pendingFootageCount = captureEvents.reduce(
                (total, event) => total + (event.footageItems?.length ?? 0),
                0,
            )

            dispatch(footageActions.setPendingFootage(pendingFootageCount))
            dispatch(footageActions.setDownloadedFootage(0))

            setSyncStep('downloading')

            const downloadResults = await downloadCaptureEventsFootage(
                captureEvents,
                dispatch,
                footageActions.addDownloadedFootage,
            )

            downloadedCount = downloadResults.reduce(
                (total, result) =>
                    total + result.downloads.filter(download => download.uri !== null).length,
                0,
            )

            failedDownloadCount = downloadResults.reduce(
                (total, result) =>
                    total + result.downloads.filter(download => download.uri === null).length,
                0,
            )

            ackedCount = downloadResults.reduce(
                (total, result) => total + result.downloads.filter(download => download.acked).length,
                0,
            )

            failedReportedCount = downloadResults.reduce(
                (total, result) =>
                    total + result.downloads.filter(download => download.failedReported).length,
                0,
            )

            setSyncStep('processing')
            const processingSummary = await processUnprocessedFootageItems()

            setSyncStep('imageMetadata')
            const imageMetadataSummary = await generateAiMetadataForSelectedFootageItems()

            setSyncStep('videoMetadata')
            const videoMetadataSummary = await generateAiMetadataForVideoFootageItems()

            setSyncStep('refreshing')
            await invalidateQueries(queryClient)

            const totalTimeUsed = formatElapsedTime(Date.now() - startedAt)

            Alert.alert(
                'Sync complete',
                [
                    `Total time used: ${totalTimeUsed}`,
                    '',
                    `Capture events: ${captureEventCount}`,
                    `Pending footage: ${pendingFootageCount}`,
                    '',
                    `Downloaded: ${downloadedCount}`,
                    `Download failed or skipped: ${failedDownloadCount}`,
                    `Acked: ${ackedCount}`,
                    `Failed reports sent: ${failedReportedCount}`,
                    '',
                    `Image quality processed: ${processingSummary.processed}`,
                    `Images selected: ${processingSummary.selected}`,
                    `Rejected blurry: ${processingSummary.rejectedBlurry}`,
                    `Rejected low quality: ${processingSummary.rejectedLowQuality}`,
                    `Rejected near duplicate: ${processingSummary.rejectedNearDuplicate}`,
                    `Quality check failed: ${processingSummary.failed}`,
                    '',
                    `Image AI processed: ${imageMetadataSummary.processed}`,
                    `Image AI succeeded: ${imageMetadataSummary.succeeded}`,
                    `Image AI skipped: ${imageMetadataSummary.skipped}`,
                    `Image AI rejected similar: ${imageMetadataSummary.rejectedSimilar}`,
                    `Image AI failed: ${imageMetadataSummary.failed}`,
                    '',
                    `Video AI processed: ${videoMetadataSummary.processed}`,
                    `Video AI succeeded: ${videoMetadataSummary.succeeded}`,
                    `Video AI skipped: ${videoMetadataSummary.skipped}`,
                    `Video AI failed: ${videoMetadataSummary.failed}`,
                ].join('\n'),
            )
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Could not complete sync.'
            const totalTimeUsed = formatElapsedTime(Date.now() - startedAt)

            Alert.alert(
                'Sync failed',
                [
                    `Total time used: ${totalTimeUsed}`,
                    '',
                    `Step: ${getSyncStepLabel(syncStep)}`,
                    message,
                    '',
                    `Capture events: ${captureEventCount}`,
                    `Pending footage: ${pendingFootageCount}`,
                    `Downloaded before failure: ${downloadedCount}`,
                    `Download failed or skipped before failure: ${failedDownloadCount}`,
                ].join('\n'),
            )
        } finally {
            dispatch(footageActions.setPendingFootage(0))
            dispatch(footageActions.setDownloadedFootage(0))
            setSyncStep('idle')
            setProcessLoading(false)
        }
    }

    if (!pendingFootage) return null

    return (
        <View className="flex-row items-center justify-between rounded-full bg-primary-fixed px-5 py-4">
            <View className="flex-row items-center gap-3">
                <View className="h-2.5 w-2.5 rounded-full bg-primary" />

                <View>
                    <Text className="font-atkinson-bold text-[16px] leading-[20px] text-on-primary-fixed">
                        {pendingFootage} {processLoading ? 'Processing...' : 'New Items'}
                    </Text>

                    <Text className="font-atkinson text-[14px] leading-[18px] text-on-primary-fixed-variant">
                        {!processLoading
                            ? 'Ready to process'
                            : isDownloading
                              ? `Downloaded: ${downloadedFootage} items`
                              : getSyncStepStatus(syncStep)}
                    </Text>
                </View>
            </View>

            {!processLoading && (
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
            )}
        </View>
    )
}

function getSyncStepStatus(step: SyncStep): string {
    switch (step) {
        case 'fetching':
            return 'Checking pending footage'
        case 'processing':
            return 'Selecting best images'
        case 'imageMetadata':
            return 'Generating image metadata'
        case 'videoMetadata':
            return 'Generating video metadata'
        case 'refreshing':
            return 'Refreshing gallery'
        case 'downloading':
            return 'Downloading footage'
        case 'idle':
        default:
            return 'Processing...'
    }
}

function getSyncStepLabel(step: SyncStep): string {
    switch (step) {
        case 'fetching':
            return 'Checking pending footage'
        case 'downloading':
            return 'Downloading footage'
        case 'processing':
            return 'Quality checking footage'
        case 'imageMetadata':
            return 'Generating image metadata'
        case 'videoMetadata':
            return 'Generating video metadata'
        case 'refreshing':
            return 'Refreshing gallery'
        case 'idle':
        default:
            return 'Idle'
    }
}

function formatElapsedTime(milliseconds: number): string {
    const safeMilliseconds = Math.max(0, milliseconds)
    const minutes = Math.floor(safeMilliseconds / 60_000)
    const seconds = Math.floor((safeMilliseconds % 60_000) / 1000)
    const remainingMilliseconds = safeMilliseconds % 1000

    return `${minutes}m ${seconds}s ${remainingMilliseconds}ms`
}
