import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'

import { colors } from '@/constants/colors'

interface Props {
    current: number
    total: number
    date: string
}

export default function FootageHeader({ current, total, date }: Props) {
    const router = useRouter()

    return (
        <View className="flex-row items-center px-5 py-3">
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.back()}
                className="h-11 w-11 items-center justify-center"
                accessibilityLabel="Go back"
                accessibilityRole="button"
            >
                <FontAwesomeIcon icon={faArrowLeft} size={20} color={colors.onSurface} />
            </TouchableOpacity>

            <View className="flex-1 items-center">
                <Text className="font-atkinson-bold text-[17px] leading-[22px] text-on-surface">
                    {current} of {total}
                </Text>
                <Text className="font-atkinson text-[15px] leading-[20px] text-on-surface-variant">
                    {date}
                </Text>
            </View>

            {/* Spacer to balance the back button */}
            <View className="h-11 w-11" />
        </View>
    )
}
