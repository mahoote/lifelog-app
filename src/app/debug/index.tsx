import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AppHeader from '@/components/appHeader'
import { generateAiMetadataForSelectedFootageItems } from '@/services/aiImageMetadataService'
import { exportLifelogDatabaseJson } from '@/utils/exportDatabase'

export default function DebugScreen() {
    const [isExporting, setIsExporting] = useState(false)
    const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false)

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

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerClassName="gap-4 p-4">
                <AppHeader title="Debug" variant="settings" />
                <Text className="text-sm text-muted-foreground">Developer tools for local testing.</Text>

                <Pressable
                    disabled={isExporting}
                    onPress={() => void handleExportDatabase()}
                    className="rounded-xl bg-primary px-4 py-3 active:opacity-80 disabled:opacity-50"
                >
                    <Text className="text-center font-semibold text-primary-foreground">
                        {isExporting ? 'Exporting...' : 'Export database JSON'}
                    </Text>
                </Pressable>

                <Pressable
                    disabled={isGeneratingMetadata}
                    onPress={() => void handleGenerateAiMetadata()}
                    className="rounded-xl bg-primary px-4 py-3 active:opacity-80 disabled:opacity-50"
                >
                    <Text className="text-center font-semibold text-primary-foreground">
                        {isGeneratingMetadata ? 'Generating metadata...' : 'Generate AI metadata'}
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    )
}
