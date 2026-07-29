import { faGear, faRotate } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Pressable, Text, View } from 'react-native'
import { colors } from '@/constants/colors'

export default function SettingsHeader() {
    return (
        <View className="flex-row items-start justify-between">
            <Text className="font-atkinson-bold text-[22px] leading-[26px] text-primary">
                MEMORY{'\n'}SUPPORT
            </Text>

            <View className="flex-row items-center gap-4">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Sync memories"
                    className="h-11 gap-2 flex-row items-center justify-center rounded-full bg-primary-container px-4 active:bg-primary-fixed-dim"
                >
                    <FontAwesomeIcon icon={faRotate} size={12} color={colors.primary} />
                    <Text className="font-atkinson-semibold text-[16px] text-primary">Sync</Text>
                </Pressable>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open settings"
                    className="h-11 w-11 items-center justify-center active:opacity-70"
                >
                    <FontAwesomeIcon icon={faGear} size={24} color={colors.primary} />
                </Pressable>
            </View>
        </View>
    )
}
