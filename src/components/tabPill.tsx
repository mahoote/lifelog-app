import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Pressable, Text } from 'react-native'
import { colors } from '@/constants/colors'

interface Props {
    label: string
    icon: IconDefinition
    active: boolean
    onPress: () => void
}

export default function TabPill({ label, icon, active, onPress }: Props) {
    return (
        <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={onPress}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-full py-3 ${
                active ? 'bg-surface shadow-soft' : 'bg-transparent'
            }`}
        >
            <FontAwesomeIcon
                icon={icon}
                size={16}
                color={active ? colors.primary : colors.onSurfaceVariant}
            />
            <Text
                className={`font-atkinson-semibold text-[16px] ${
                    active ? 'text-primary' : 'text-on-surface-variant'
                }`}
            >
                {label}
            </Text>
        </Pressable>
    )
}
