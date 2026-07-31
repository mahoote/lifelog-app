import * as FileSystem from 'expo-file-system/legacy'
import { db } from '@/database'

type TableName = 'capture_event' | 'footage_item' | 'gallery_day'

const TABLES: TableName[] = ['capture_event', 'footage_item', 'gallery_day']

export async function exportLifelogDatabaseJson(): Promise<{
    success: boolean
    uri?: string
    error?: string
}> {
    try {
        const exportData: Record<TableName, unknown[]> = {
            capture_event: [],
            footage_item: [],
            gallery_day: [],
        }

        for (const table of TABLES) {
            exportData[table] = await db.getAllAsync(`SELECT * FROM ${table};`)
        }

        const fileName = `lifelog-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`

        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()

        if (!permissions.granted) {
            return {
                success: false,
                error: 'Storage permission was not granted.',
            }
        }

        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'application/json',
        )

        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2), {
            encoding: FileSystem.EncodingType.UTF8,
        })

        return {
            success: true,
            uri: fileUri,
        }
    } catch (error) {
        console.error('Failed to export database JSON', error)

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown export error',
        }
    }
}
