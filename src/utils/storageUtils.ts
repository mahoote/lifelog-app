import { Directory, Paths } from 'expo-file-system'

/**
 * Gets the total size in bytes of all footage files stored in the private document directory.
 */
export function getUsedFootageStorageBytes(): number {
    const footageDir = new Directory(Paths.document, 'footage')

    if (!footageDir.exists) {
        return 0
    }

    const files = footageDir.list()

    return files.reduce((total, item) => {
        if (item instanceof File) {
            return total + item.size
        }

        return total
    }, 0)
}
