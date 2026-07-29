import { faArrowDownWideShort, faCalendar, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Pressable, Text, View } from 'react-native'
import { colors } from '@/constants/colors'

export default function DateFilterRow() {
    return (
        <View className="flex-row items-center justify-between">
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select date"
                className="flex-row items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 py-3 active:bg-surface-container"
            >
                <FontAwesomeIcon icon={faCalendar} size={15} color={colors.onSurfaceVariant} />
                <Text className="font-atkinson-medium text-[16px] text-on-surface">Oct 24, 2023</Text>
                <FontAwesomeIcon icon={faChevronDown} size={12} color={colors.onSurfaceVariant} />
            </Pressable>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sort images"
                className="flex-row items-center gap-2 active:opacity-70"
            >
                <Text className="font-atkinson-medium text-[16px] text-on-surface-variant">
                    324 Images
                </Text>
                <FontAwesomeIcon icon={faArrowDownWideShort} size={16} color={colors.onSurfaceVariant} />
            </Pressable>
        </View>
    )
}
