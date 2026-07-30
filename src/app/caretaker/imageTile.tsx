import { faRotate } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useRouter } from 'expo-router'
import { Image, Pressable, Text, View } from 'react-native'
import { colors } from '@/constants/colors'

import { MediaItem } from '@/types/media'

interface Props {
    item: MediaItem
    size: number
}

export default function ImageTile({ item, size }: Props) {
    const router = useRouter()
    const tileStyle = { width: size, height: size }

    if (item.overflow !== undefined) {
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Show ${item.overflow} more items`}
                style={tileStyle}
                className="items-center justify-center rounded-lg bg-surface-container-high active:opacity-80"
            >
                <Text className="font-atkinson-bold text-[20px] text-on-surface-variant">
                    +{item.overflow}
                </Text>
            </Pressable>
        )
    }

    if (item.badge === 'processing') {
        return (
            <View
                style={tileStyle}
                className="items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant bg-surface-container"
            >
                <FontAwesomeIcon icon={faRotate} size={20} color={colors.primary} />
                <Text className="font-atkinson-medium text-[12px] text-on-surface-variant">
                    Processing...
                </Text>
            </View>
        )
    }

    return (
        <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel={item.time ? `Memory at ${item.time}` : 'Memory image'}
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
            {item.uri ? (
                <Image source={{ uri: item.uri }} className="h-full w-full" resizeMode="cover" />
            ) : (
                <View className="h-full w-full bg-surface-container-high" />
            )}

            <View className="absolute inset-0 justify-end p-2">
                {item.time ? (
                    <View className="self-start rounded-md bg-black/50 px-2 py-1">
                        <Text className="font-atkinson-semibold text-[13px] text-white">
                            {item.time}
                        </Text>
                    </View>
                ) : null}
            </View>
        </Pressable>
    )
}
