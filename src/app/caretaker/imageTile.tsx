import { useRouter } from 'expo-router'
import { Image, Pressable, Text, View } from 'react-native'

import { FootageItem } from '@/types/footageItem'

interface Props {
    item: FootageItem
    size: number
}

export default function ImageTile({ item, size }: Props) {
    const router = useRouter()
    const tileStyle = { width: size, height: size }

    return (
        <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel={item.createdAt ? `Memory at ${item.createdAt}` : 'Memory image'}
            style={tileStyle}
            className="overflow-hidden rounded-lg active:opacity-90"
            onPress={() => {
                router.push({
                    pathname: '/footage',
                    params: {
                        id: item.id,
                    },
                })
            }}
        >
            {item.fileUri ? (
                <Image source={{ uri: item.fileUri }} className="h-full w-full" resizeMode="cover" />
            ) : (
                <View className="h-full w-full bg-surface-container-high" />
            )}

            <View className="absolute inset-0 justify-end p-2">
                {item.createdAt ? (
                    <View className="self-start rounded-md bg-black/50 px-2 py-1">
                        <Text className="font-atkinson-semibold text-[13px] text-white">
                            {item.createdAt}
                        </Text>
                    </View>
                ) : null}
            </View>
        </Pressable>
    )
}
