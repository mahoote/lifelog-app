import { Text, useWindowDimensions, View } from 'react-native'

import ImageTile from '@/app/caretaker/imageTile'
import { useGalleryImages } from '@/hooks/useGalleryImages'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedDate } from '@/store/selectors'
import { FootageItem } from '@/types/footageItem'
import { getDayKey, groupByTimeOfDay } from '@/utils/dateUtils'

export default function ImageSection() {
    const { width } = useWindowDimensions()

    const selectedDate = useAppSelector(selectSelectedDate)
    const dayKey = getDayKey(selectedDate?.toISOString() ?? '')

    const { data: images = [], isLoading, isFetching, error } = useGalleryImages(dayKey)
    const tileSize = (width - 64 - 16) / 3

    if (!dayKey) {
        return (
            <Text className="font-atkinson-medium text-[14px] text-on-surface-variant text-center">
                No day selected.
            </Text>
        )
    }

    if (isLoading) {
        return (
            <View className="gap-2">
                {[0, 1].map(row => (
                    <View key={row} className="flex-row gap-2">
                        {[0, 1, 2].map(col => (
                            <View
                                key={col}
                                style={{ width: tileSize, height: tileSize }}
                                className="rounded-lg bg-surface-container-high"
                            />
                        ))}
                    </View>
                ))}
            </View>
        )
    }

    if (error) {
        return (
            <Text className="font-atkinson-medium text-[14px] text-error text-center">
                Could not load images.
            </Text>
        )
    }

    if (images.length === 0) {
        return (
            <Text className="font-atkinson-medium text-[14px] text-on-surface-variant text-center">
                No images for this day.
            </Text>
        )
    }

    const groups = groupByTimeOfDay(images)

    return (
        <View>
            {isFetching && (
                <Text className="font-atkinson-medium text-[12px] text-on-surface-variant">
                    Updating...
                </Text>
            )}

            <View className="items-end w-full">
                <Text className="font-atkinson">{images.length} images</Text>
            </View>

            <View className="gap-6">
                {groups.map(({ label, items }) => {
                    const rows: FootageItem[][] = []
                    for (let i = 0; i < items.length; i += 3) {
                        rows.push(items.slice(i, i + 3))
                    }

                    return (
                        <View key={label}>
                            <Text className="mb-3 font-atkinson-bold text-[22px] leading-[28px] text-on-surface">
                                {label}
                            </Text>

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
                })}
            </View>
        </View>
    )
}
