import { type IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Pressable, Text } from 'react-native'

import { colors } from '@/constants/colors'

interface Props {
    label: string
    icon: IconDefinition
    isActive: boolean
    onPress: () => void
}

export default function TabPill({ label, icon, isActive, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-full py-3 ${
                isActive ? 'bg-surface' : 'bg-transparent'
            }`}
        >
            <FontAwesomeIcon
                icon={icon}
                size={16}
                color={isActive ? colors.primary : colors.onSurfaceVariant}
            />
            <Text
                className={`font-atkinson-semibold text-[16px] ${
                    isActive ? 'text-primary' : 'text-on-surface-variant'
                }`}
            >
                {label}
            </Text>
        </Pressable>
    )
}
