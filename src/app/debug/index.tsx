import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import AppHeader from '@/components/appHeader'
import { resetProcessedSelectedFootageItems } from '@/repositories/footageItemRepository'
import {
    generateAiMetadataForSelectedFootageItems,
    generateAiMetadataForVideoFootageItems,
} from '@/services/aiImageMetadataService'
import { processUnprocessedFootageItems } from '@/services/footageProcessingService'
import { getLifelogPendingFootage } from '@/services/lifelogService'
import { footageActions } from '@/store/footageSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { downloadCaptureEventsFootage } from '@/utils/downloadUtils'
import { exportLifelogDatabaseJson } from '@/utils/exportDatabase'

export default function DebugScreen() {
    const dispatch = useAppDispatch()

    const pendingFootage = useAppSelector(state => state.footage.pendingFootage)
    const downloadedFootage = useAppSelector(state => state.footage.downloadedFootage)

    const [isExporting, setIsExporting] = useState(false)
    const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false)
    const [isGeneratingVideoMetadata, setIsGeneratingVideoMetadata] = useState(false)
    const [isProcessingFootage, setIsProcessingFootage] = useState(false)
    const [isDownloadingFootage, setIsDownloadingFootage] = useState(false)
    const [isResettingFootage, setIsResettingFootage] = useState(false)

    async function handleExportDatabase() {
        if (isExporting) {
            return
        }

        setIsExporting(true)

        try {
            const result = await exportLifelogDatabaseJson()

            if (!result.success) {
                Alert.alert('Export failed', result.error ?? 'Could not export database.')
                return
            }

            Alert.alert('Export complete', 'Database JSON was exported successfully.')
        } finally {
            setIsExporting(false)
        }
    }

    async function handleGenerateAiMetadata() {
        if (isGeneratingMetadata) {
            return
        }

        setIsGeneratingMetadata(true)

        try {
            const summary = await generateAiMetadataForSelectedFootageItems()

            Alert.alert(
                'AI metadata complete',
                [
                    `Processed: ${summary.processed}`,
                    `Skipped: ${summary.skipped}`,
                    `Succeeded: ${summary.succeeded}`,
                    `Failed: ${summary.failed}`,
                ].join('\n'),
            )
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Could not generate AI metadata.'

            Alert.alert('AI metadata failed', message)
        } finally {
            setIsGeneratingMetadata(false)
        }
    }

    async function handleGenerateVideoAiMetadata() {
        if (isGeneratingVideoMetadata) {
            return
        }

        setIsGeneratingVideoMetadata(true)

        try {
            const summary = await generateAiMetadataForVideoFootageItems()

            Alert.alert(
                'Video AI metadata complete',
                [
                    `Processed: ${summary.processed}`,
                    `Skipped: ${summary.skipped}`,
                    `Succeeded: ${summary.succeeded}`,
                    `Failed: ${summary.failed}`,
                ].join('\n'),
            )
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Could not generate video AI metadata.'

            Alert.alert('Video AI metadata failed', message)
        } finally {
            setIsGeneratingVideoMetadata(false)
        }
    }

    async function handleProcessFootage() {
        if (isProcessingFootage) {
            return
        }

        setIsProcessingFootage(true)

        try {
            const summary = await processUnprocessedFootageItems()

            Alert.alert(
                'Processing complete',
                [
                    `Processed: ${summary.processed}`,
                    `Selected: ${summary.selected}`,
                    `Rejected blurry: ${summary.rejectedBlurry}`,
                    `Rejected low quality: ${summary.rejectedLowQuality}`,
                    `Rejected near duplicate: ${summary.rejectedNearDuplicate}`,
                    `Failed: ${summary.failed}`,
                ].join('\n'),
            )
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Could not process footage.'

            Alert.alert('Processing failed', message)
        } finally {
            setIsProcessingFootage(false)
        }
    }

    async function handleDownloadFootage() {
        if (isDownloadingFootage) {
            return
        }

        setIsDownloadingFootage(true)

        try {
            const captureEvents = await getLifelogPendingFootage()
            const pendingFootageCount = captureEvents.reduce(
                (total, captureEvent) => total + (captureEvent.footageItems?.length ?? 0),
                0,
            )

            dispatch(footageActions.setPendingFootage(pendingFootageCount))
            dispatch(footageActions.setDownloadedFootage(0))

            const results = await downloadCaptureEventsFootage(
                captureEvents,
                dispatch,
                footageActions.addDownloadedFootage,
            )

            const downloadedCount = results.reduce(
                (total, result) =>
                    total + result.downloads.filter(download => download.uri !== null).length,
                0,
            )

            const failedCount = results.reduce(
                (total, result) =>
                    total + result.downloads.filter(download => download.uri === null).length,
                0,
            )

            Alert.alert(
                'Download complete',
                [
                    `Capture events: ${captureEvents.length}`,
                    `Pending footage: ${pendingFootageCount}`,
                    `Downloaded: ${downloadedCount}`,
                    `Failed or skipped: ${failedCount}`,
                ].join('\n'),
            )
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Could not download footage.'

            Alert.alert('Download failed', message)
        } finally {
            setIsDownloadingFootage(false)
        }
    }

    async function handleResetProcessedSelectedFootage() {
        if (isResettingFootage) {
            return
        }

        setIsResettingFootage(true)

        try {
            const changedCount = await resetProcessedSelectedFootageItems()

            Alert.alert(
                'Reset complete',
                `${changedCount} selected footage items were reset to candidate and marked unprocessed.`,
            )
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Could not reset footage.'

            Alert.alert('Reset failed', message)
        } finally {
            setIsResettingFootage(false)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <ScrollView
                className="flex-1 px-6"
                contentContainerClassName="gap-4 pb-10"
                showsVerticalScrollIndicator={false}
            >
                <AppHeader title="Debug" variant="settings" />

                <Text className="font-atkinson text-[16px] leading-[22px] text-on-surface-variant">
                    Developer tools for local testing.
                </Text>

                <Pressable
                    disabled={isExporting}
                    onPress={() => void handleExportDatabase()}
                    className="rounded-xl bg-primary px-4 py-3 active:opacity-80 disabled:opacity-50"
                >
                    <Text className="text-center font-atkinson-bold text-[16px] text-on-primary">
                        {isExporting ? 'Exporting...' : 'Export database JSON'}
                    </Text>
                </Pressable>

                <Pressable
                    disabled={isDownloadingFootage}
                    onPress={() => void handleDownloadFootage()}
                    className="rounded-xl bg-primary px-4 py-3 active:opacity-80 disabled:opacity-50"
                >
                    <Text className="text-center font-atkinson-bold text-[16px] text-on-primary">
                        {isDownloadingFootage ? 'Downloading footage...' : 'Download footage'}
                    </Text>
                </Pressable>
                {isDownloadingFootage && (
                    <Text className="text-center font-atkinson text-[14px] text-on-surface-variant">
                        {downloadedFootage} of {pendingFootage} downloaded
                    </Text>
                )}

                <Pressable
                    disabled={isProcessingFootage}
                    onPress={() => void handleProcessFootage()}
                    className="rounded-xl bg-primary px-4 py-3 active:opacity-80 disabled:opacity-50"
                >
                    <Text className="text-center font-atkinson-bold text-[16px] text-on-primary">
                        {isProcessingFootage ? 'Quality checking footage...' : 'Quality check footage'}
                    </Text>
                </Pressable>

                <Pressable
                    disabled={isGeneratingMetadata}
                    onPress={() => void handleGenerateAiMetadata()}
                    className="rounded-xl bg-primary px-4 py-3 active:opacity-80 disabled:opacity-50"
                >
                    <Text className="text-center font-atkinson-bold text-[16px] text-on-primary">
                        {isGeneratingMetadata ? 'Generating metadata...' : 'Generate AI metadata'}
                    </Text>
                </Pressable>

                <Pressable
                    disabled={isGeneratingVideoMetadata}
                    onPress={() => void handleGenerateVideoAiMetadata()}
                    className="rounded-xl bg-primary px-4 py-3 active:opacity-80 disabled:opacity-50"
                >
                    <Text className="text-center font-atkinson-bold text-[16px] text-on-primary">
                        {isGeneratingVideoMetadata
                            ? 'Generating video metadata...'
                            : 'Generate video AI metadata'}
                    </Text>
                </Pressable>

                <Pressable
                    disabled={isResettingFootage}
                    onPress={() => void handleResetProcessedSelectedFootage()}
                    className="rounded-xl bg-error px-4 py-3 active:opacity-80 disabled:opacity-50"
                >
                    <Text className="text-center font-atkinson-bold text-[16px] text-on-error">
                        {isResettingFootage
                            ? 'Resetting footage...'
                            : 'Reset processed selected footage'}
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    )
}
