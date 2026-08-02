import { faCirclePlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useRouter } from 'expo-router'
import { Image, Pressable, Text, View } from 'react-native'

import { colors } from '@/constants/colors'
import { FootageItem, FootageType } from '@/types/footageItem'

interface Props {
    item: FootageItem
}

export default function VideoCard({ item }: Props) {
    const router = useRouter()

    const title = item.title?.trim() ?? 'Video'
    const description = item.description?.trim() ?? 'Video footage'

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View video: ${title}`}
            className="flex-row items-center rounded-lg bg-surface-container-low p-3 active:opacity-80"
            onPress={() => {
                if (!item.id) {
                    return
                }

                router.push({
                    pathname: '/footage',
                    params: {
                        id: item.id,
                        type: FootageType.VIDEO,
                    },
                })
            }}
        >
            <View className="mr-4 h-[84px] w-[104px] overflow-hidden rounded-md bg-surface-container-high">
                {item.fileUri ? (
                    <Image source={{ uri: item.fileUri }} className="h-full w-full" resizeMode="cover" />
                ) : (
                    <View className="h-full w-full bg-surface-container-highest" />
                )}

                <View className="absolute inset-0 items-center justify-center">
                    <FontAwesomeIcon icon={faCirclePlay} size={28} color={colors.onPrimary} />
                </View>
            </View>

            <View className="flex-1">
                <View className="mb-1 flex-row items-center justify-between">
                    <Text
                        className="flex-1 font-atkinson-bold text-[17px] leading-[22px] text-on-surface"
                        numberOfLines={1}
                    >
                        {title}
                    </Text>

                    {item.durationS !== null && (
                        <Text className="ml-3 font-atkinson-semibold text-[15px] text-primary">
                            {item.durationS}s
                        </Text>
                    )}
                </View>

                <Text
                    className="font-atkinson text-[15px] leading-[21px] text-on-surface-variant"
                    numberOfLines={2}
                >
                    {description}
                </Text>
            </View>
        </Pressable>
    )
}
