import { Pressable, Text } from 'react-native'

/**
 * Basic button created with Pressable component.
 * @param param0
 * @param param0.title
 * @param param0.onPress
 * @constructor
 */
export function AppButton({
    title,
    onPress,
}: {
    title: string
    onPress?: () => void
}) {
    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            className="items-center rounded-xl bg-blue-600 px-4 py-3 active:bg-blue-700"
        >
            <Text className="font-medium text-white">{title}</Text>
        </Pressable>
    )
}
