import { Pressable, Text } from 'react-native'

interface Props {
    title: string
    onPress?: () => void
    loading?: boolean
}

/**
 * Basic button created with Pressable component.
 * @param param0 - Props
 * @param param0.title
 * @param param0.onPress
 * @constructor
 */
export function AppButton({ title, onPress, loading }: Props) {
    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            disabled={loading}
            className="items-center rounded-xl bg-blue-500 px-4 py-3 active:bg-blue-600"
        >
            <Text className="font-medium text-white">{loading ? 'Loading...' : title}</Text>
        </Pressable>
    )
}
