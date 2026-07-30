import { Text, useWindowDimensions, View } from 'react-native'
import ImageTile from '@/app/caretaker/imageTile'
import { useGalleryImages } from '@/hooks/useGalleryImages'

import { MediaItem } from '@/types/media'
import { formatImageTime } from '@/utils/dateUtils'

interface Props {
    title: string
    dayKey: string | null
}

export default function ImageSection({ title, dayKey }: Props) {
    const { width } = useWindowDimensions()
    const { data: images = [], isLoading, isFetching, error } = useGalleryImages(dayKey)

    const tileSize = (width - 64 - 16) / 3

    const items: MediaItem[] = images.map(image => ({
        id: image.id,
        uri: image.fileUri,
        time: formatImageTime(image.createdAt),
    }))

    const rows: MediaItem[][] = []

    for (let i = 0; i < items.length; i += 3) {
        rows.push(items.slice(i, i + 3))
    }

    if (!dayKey) {
        return (
            <View>
                <Text className="mb-4 font-atkinson-bold text-[22px] leading-[28px] text-on-surface">
                    {title}
                </Text>

                <Text className="font-atkinson-medium text-[14px] text-on-surface-variant">
                    No day selected.
                </Text>
            </View>
        )
    }

    if (isLoading) {
        return (
            <View>
                <Text className="mb-4 font-atkinson-bold text-[22px] leading-[28px] text-on-surface">
                    {title}
                </Text>

                <View className="gap-2">
                    <View className="flex-row gap-2">
                        {[0, 1, 2].map(index => (
                            <View
                                key={index}
                                style={{ width: tileSize, height: tileSize }}
                                className="rounded-lg bg-surface-container-high"
                            />
                        ))}
                    </View>

                    <View className="flex-row gap-2">
                        {[0, 1, 2].map(index => (
                            <View
                                key={index}
                                style={{ width: tileSize, height: tileSize }}
                                className="rounded-lg bg-surface-container-high"
                            />
                        ))}
                    </View>
                </View>
            </View>
        )
    }

    if (error) {
        return (
            <View>
                <Text className="mb-4 font-atkinson-bold text-[22px] leading-[28px] text-on-surface">
                    {title}
                </Text>

                <Text className="font-atkinson-medium text-[14px] text-error">
                    Could not load images.
                </Text>
            </View>
        )
    }

    if (items.length === 0) {
        return (
            <View>
                <Text className="mb-4 font-atkinson-bold text-[22px] leading-[28px] text-on-surface">
                    {title}
                </Text>

                <Text className="font-atkinson-medium text-[14px] text-on-surface-variant">
                    No images for this day.
                </Text>
            </View>
        )
    }

    return (
        <View>
            <View className="mb-4 flex-row items-center justify-between">
                <Text className="font-atkinson-bold text-[22px] leading-[28px] text-on-surface">
                    {title}
                </Text>

                {isFetching ? (
                    <Text className="font-atkinson-medium text-[12px] text-on-surface-variant">
                        Updating...
                    </Text>
                ) : null}
            </View>

            <View className="gap-2">
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row gap-2">
                        {row.map(item => (
                            <ImageTile key={item.id} item={item} size={tileSize} />
                        ))}
                    </View>
                ))}
            </View>
        </View>
    )
}
