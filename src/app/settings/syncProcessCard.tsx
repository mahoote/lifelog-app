import { faArrowsRotate, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Pressable, Text, View } from 'react-native'
import { colors } from '@/constants/colors'
import { deleteAllSavedFootage } from '@/utils/storageUtils'

export default function SyncProcessCard() {
    return (
        <View className="mt-6 rounded-lg bg-surface-container-low px-6 py-7">
            <View className="mb-5 flex-row items-center">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-md bg-secondary-container">
                    <FontAwesomeIcon icon={faArrowsRotate} size={20} color={colors.primary} />
                </View>

                <View className="flex-1">
                    <Text className="font-atkinson-bold text-[18px] leading-[24px] text-on-surface">
                        Sync &amp; Process
                    </Text>
                    <Text className="mt-1 font-atkinson text-[17px] leading-[24px] text-on-surface-variant">
                        Download and organize footage
                    </Text>
                </View>
            </View>

            <View className="mb-5 h-2 rounded-full bg-surface-container-highest" />

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete all data"
                className="h-14 flex-row items-center justify-center rounded-full border-2 border-error bg-surface gap-3 active:bg-error-container"
                onPress={() => void deleteAllSavedFootage()}
            >
                <FontAwesomeIcon icon={faTrash} size={16} color={colors.error} />
                <Text className="font-atkinson-bold text-[17px] text-error">Delete All Data</Text>
            </Pressable>
        </View>
    )
}
