import { useState } from 'react'
import { Alert, Pressable, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { exportLifelogDatabaseJson } from '@/utils/exportDatabase'

export default function ExportDatabaseJsonButton() {
    const [isExporting, setIsExporting] = useState(false)

    async function handleExportDatabase() {
        if (isExporting) {
            return
        }

        setIsExporting(true)

        const result = await exportLifelogDatabaseJson()

        setIsExporting(false)

        if (!result.success) {
            Alert.alert('Export failed', result.error ?? 'Could not export database.')
            return
        }

        Alert.alert('Export complete', 'Database JSON was exported successfully.')
    }

    return (
        <SafeAreaView>
            <Pressable
                accessibilityRole="button"
                disabled={isExporting}
                onPress={() => void handleExportDatabase()}
                className="rounded-xl bg-primary px-4 py-3 active:opacity-80 disabled:opacity-50"
            >
                <Text className="text-center font-atkinson-bold text-on-primary">
                    {isExporting ? 'Exporting...' : 'Export database JSON'}
                </Text>
            </Pressable>
        </SafeAreaView>
    )
}
