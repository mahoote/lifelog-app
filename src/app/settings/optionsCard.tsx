import { faBug, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { colors } from '@/constants/colors'
import { deleteAllSavedFootage } from '@/utils/storageUtils'

export default function OptionsCard() {
    const router = useRouter()
    const queryClient = useQueryClient()

    return (
        <View className="mt-6 rounded-lg bg-surface-container-low px-6 py-7">
            <View className="flex-1 mb-5">
                <Text className="font-atkinson-bold text-[18px] leading-[24px] text-on-surface">
                    Options
                </Text>
            </View>

            <View className="flex gap-2">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Delete all data"
                    className="h-14 flex-row items-center justify-center rounded-full border-2 border-error bg-surface gap-3 active:bg-error-container"
                    onPress={() => void deleteAllSavedFootage(queryClient)}
                >
                    <FontAwesomeIcon icon={faTrash} size={16} color={colors.error} />
                    <Text className="font-atkinson-bold text-[17px] text-error">Delete All Data</Text>
                </Pressable>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Debug"
                    className="h-14 flex-row items-center justify-center rounded-full border-2 border-primary bg-surface gap-3 active:bg-error-container"
                    onPress={() => router.push('/debug')}
                >
                    <FontAwesomeIcon icon={faBug} size={16} color={colors.primary} />
                    <Text className="font-atkinson-bold text-[17px] text-primary">Debug</Text>
                </Pressable>
            </View>
        </View>
    )
}
