import { faCirclePlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Image, Pressable, Text, View } from 'react-native'

import { colors } from '@/constants/colors'
import { VideoItem } from '@/types/video'

interface Props {
    item: VideoItem
}

export default function VideoCard({ item }: Props) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Play video: ${item.title}`}
            className="flex-row items-center rounded-lg bg-surface-container-low p-3 active:opacity-80"
        >
            <View className="mr-4 h-[84px] w-[104px] overflow-hidden rounded-md bg-surface-container-high">
                {item.uri ? (
                    <Image source={{ uri: item.uri }} className="h-full w-full" resizeMode="cover" />
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
                        {item.title}
                    </Text>
                    <Text className="ml-3 font-atkinson-semibold text-[15px] text-primary">
                        {item.time}
                    </Text>
                </View>

                <Text className="font-atkinson text-[15px] leading-[21px] text-on-surface-variant">
                    {item.location} • {item.activity}
                </Text>
            </View>
        </Pressable>
    )
}
