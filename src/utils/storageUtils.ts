import { Directory, Paths, File } from 'expo-file-system'

/**
 * Gets the total size in bytes of all footage files stored in the private document directory.
 */
export function getUsedFootageStorageBytes(): number {
    const imagesDir = new Directory(Paths.document, 'images')

    if (!imagesDir.exists) {
        return 0
    }

    const files = imagesDir.list()

    return files.reduce((total, item) => {
        if (item instanceof File) {
            return total + item.size
        }

        return total
    }, 0)
}

/**
 * Deletes all locally saved lifelog footage.
 */
export function deleteAllSavedFootage(): void {
    const imagesDir = new Directory(Paths.document, 'images')
    const videosDir = new Directory(Paths.document, 'videos')

    if (imagesDir.exists) {
        imagesDir.delete()
    }

    if (videosDir.exists) {
        videosDir.delete()
    }

    console.info('Deleted all saved lifelog footage', new Date().toISOString())
}
