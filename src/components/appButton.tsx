import { Pressable, Text } from 'react-native'

interface Props {
    title: string
    onPress?: () => void
    loading?: boolean
    hasLoadingText?: boolean
    color?: 'blue' | 'red'
}

/**
 * Basic button created with Pressable component.
 * @param param0 - Props
 * @param param0.title
 * @param param0.onPress
 * @constructor
 */
export function AppButton({ title, onPress, loading, hasLoadingText = true, color = 'blue' }: Props) {
    const getButtonColor = () => {
        let bgColorStrength = '500'
        const activeBgColorStrength = '600'
        if (loading) bgColorStrength = '400'

        return {
            bgColor: `bg-${color}-${bgColorStrength}`,
            activeBgColor: `active:bg-${color}-${activeBgColorStrength}`,
        }
    }

    const { bgColor, activeBgColor } = getButtonColor()

    const loadingText = hasLoadingText ? 'Loading...' : title

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            disabled={loading}
            className={`items-center rounded-xl ${bgColor} px-4 py-3 ${activeBgColor}`}
        >
            <Text className="font-medium text-white">{loading ? loadingText : title}</Text>
        </Pressable>
    )
}
