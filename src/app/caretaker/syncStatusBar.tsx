import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Pressable, Text, View } from 'react-native'
import { colors } from '@/constants/colors'

export default function SyncStatusBar() {
    return (
        <View className="flex-row items-center justify-between rounded-full bg-primary-fixed px-5 py-4">
            <View className="flex-row items-center gap-3">
                <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                <View>
                    <Text className="font-atkinson-bold text-[16px] leading-[20px] text-on-primary-fixed">
                        239 New Items
                    </Text>
                    <Text className="font-atkinson text-[14px] leading-[18px] text-on-primary-fixed-variant">
                        Processed: 54
                    </Text>
                </View>
            </View>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Process new items"
                className="h-11 flex-row items-center justify-center gap-2 rounded-full bg-primary px-5 active:bg-on-primary-container"
            >
                <FontAwesomeIcon icon={faWandMagicSparkles} size={14} color={colors.onPrimary} />
                <Text className="font-atkinson-bold text-[16px] text-on-primary">Process</Text>
            </Pressable>
        </View>
    )
}
