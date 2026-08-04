import { QueryClient } from '@tanstack/react-query'
import { Directory, Paths, File } from 'expo-file-system'

import { deleteFootageItemByFileUriSync } from '@/repositories/footageItemRepository'
import { deleteAllLifelogDataAndVacuum } from '@/repositories/galleryDayRepository'
import { invalidateQueries } from '@/utils/queryUtils'

interface StoredFootageFile {
    file: File
    uri: string
    size: number
    modificationTime: number
}

function getFootageDirectories(): Directory[] {
    return [new Directory(Paths.document, 'images'), new Directory(Paths.document, 'videos')]
}

function getStoredFootageFiles(): StoredFootageFile[] {
    const files: StoredFootageFile[] = []

    for (const directory of getFootageDirectories()) {
        if (!directory.exists) {
            continue
        }

        for (const item of directory.list()) {
            if (!(item instanceof File)) {
                continue
            }

            files.push({
                file: item,
                uri: item.uri,
                size: item.size,
                modificationTime: item.modificationTime ?? 0,
            })
        }
    }

    return files
}

/**
 * Deletes the oldest locally saved footage files until there is enough room for a new file.
 *
 * Also deletes the matching footage_item database row and refreshes gallery_day.
 *
 * @param incomingSizeBytes - The size of the file that should be downloaded.
 * @param maxStorageBytes - The maximum allowed local footage storage.
 * @return True when enough space is available after cleanup.
 */
export function makeRoomForFootageDownload(incomingSizeBytes: number, maxStorageBytes: number): boolean {
    if (incomingSizeBytes > maxStorageBytes) {
        console.error(
            `Incoming footage is larger than max storage. Size: ${incomingSizeBytes}, Max: ${maxStorageBytes}`,
        )

        return false
    }

    const files = getStoredFootageFiles().sort((a, b) => a.modificationTime - b.modificationTime)

    let usedBytes = files.reduce((total, file) => total + file.size, 0)

    if (usedBytes + incomingSizeBytes <= maxStorageBytes) {
        return true
    }

    for (const storedFile of files) {
        try {
            storedFile.file.delete()
            deleteFootageItemByFileUriSync(storedFile.uri)

            usedBytes -= storedFile.size

            console.info(`Deleted old footage file ${storedFile.uri}. Freed ${storedFile.size} bytes.`)

            if (usedBytes + incomingSizeBytes <= maxStorageBytes) {
                return true
            }
        } catch (error) {
            console.warn(`Failed to delete old footage file ${storedFile.uri}:`, error)
        }
    }

    console.error(
        `Not enough storage after deleting old footage. Used: ${usedBytes}, Incoming: ${incomingSizeBytes}, Max: ${maxStorageBytes}`,
    )

    return false
}

/**
 * Deletes all locally saved lifelog footage.
 */
export async function deleteAllSavedFootage(queryClient: QueryClient) {
    const imagesDir = new Directory(Paths.document, 'images')
    const videosDir = new Directory(Paths.document, 'videos')

    if (imagesDir.exists) {
        imagesDir.delete()
    }

    if (videosDir.exists) {
        videosDir.delete()
    }

    await deleteAllLifelogDataAndVacuum()
    await invalidateQueries(queryClient)

    console.info('Deleted all saved lifelog footage', new Date().toISOString())
}
