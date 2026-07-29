import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Pressable, Text, View } from 'react-native'
import { colors } from '@/constants/colors'
import { RoleOption } from '@/types/role'

interface Props {
    role: RoleOption
    selected: boolean
    onPress: () => void
}

export default function RoleCard({ role, selected, onPress }: Props) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={onPress}
            className={`min-h-[226px] flex-1 rounded-lg px-5 py-5 active:opacity-80 ${
                selected
                    ? 'border-2 border-primary bg-primary-container'
                    : 'border-2 border-transparent bg-surface-container-high'
            }`}
        >
            <View
                className={`mb-5 h-10 w-10 items-center justify-center rounded-full ${
                    selected ? 'bg-primary-container' : 'bg-surface-dim'
                }`}
            >
                <FontAwesomeIcon icon={role.icon} size={20} color={colors.onSurfaceVariant} />
            </View>

            <Text
                className={`mb-2 font-atkinson-bold text-[17px] leading-[24px] ${
                    selected ? 'text-primary' : 'text-on-surface-variant'
                }`}
            >
                {role.title}
            </Text>

            <Text
                className={`font-atkinson text-[18px] leading-[24px] ${
                    selected ? 'text-primary' : 'text-on-surface-variant'
                }`}
            >
                {role.description}
            </Text>
        </Pressable>
    )
}
