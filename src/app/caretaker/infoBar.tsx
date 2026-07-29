import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Text, View } from 'react-native'

import { colors } from '@/constants/colors'

export default function InfoBar() {
    return (
        <View className="flex-row items-start gap-3">
            <FontAwesomeIcon icon={faCircleInfo} size={18} color={colors.onSurfaceVariant} />
            <Text className="flex-1 font-atkinson text-[17px] leading-[25px] text-on-surface-variant">
                Daily activity review for context.
            </Text>
        </View>
    )
}
