import { Text, useWindowDimensions, View } from 'react-native'

import VideoCard from '@/app/caretaker/videoCard'
import { useGalleryImages } from '@/hooks/useGalleryImages'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedDate } from '@/store/selectors'
import { FootageType } from '@/types/footageItem'
import { getDayKey, groupByTimeOfDay } from '@/utils/dateUtils'

export default function VideoSection() {
    const { width } = useWindowDimensions()

    const selectedDate = useAppSelector(selectSelectedDate)
    const dayKey = getDayKey(selectedDate?.toISOString() ?? '')

    const {
        data: videos = [],
        isLoading,
        isFetching,
        error,
    } = useGalleryImages(dayKey, FootageType.VIDEO)
    const cardWidth = width - 64

    if (!dayKey) {
        return (
            <Text className="mt-6 text-center font-atkinson text-[16px] text-on-surface-variant">
                No day selected.
            </Text>
        )
    }

    if (isLoading) {
        return (
            <View className="gap-3">
                {[0, 1, 2].map(index => (
                    <View
                        key={index}
                        style={{ width: cardWidth, height: 108 }}
                        className="rounded-lg bg-surface-container-high"
                    />
                ))}
            </View>
        )
    }

    if (error) {
        return (
            <Text className="mt-6 text-center font-atkinson text-[16px] text-error">
                Could not load videos.
            </Text>
        )
    }

    if (videos.length === 0) {
        return (
            <Text className="mt-6 text-center font-atkinson text-[16px] text-on-surface-variant">
                No videos for this day.
            </Text>
        )
    }

    const groups = groupByTimeOfDay(videos)

    return (
        <View>
            {isFetching && (
                <Text className="mb-2 text-center font-atkinson text-[14px] text-on-surface-variant">
                    Updating...
                </Text>
            )}

            <Text className="mb-4 font-atkinson-semibold text-[15px] text-on-surface-variant">
                {videos.length} videos
            </Text>

            <View className="gap-7">
                {groups.map(({ label, items }) => (
                    <View key={label}>
                        <Text className="mb-3 font-atkinson-bold text-[13px] uppercase tracking-[1.4px] text-secondary">
                            {label}
                        </Text>

                        <View className="gap-3">
                            {items.map(item => (
                                <VideoCard key={item.id} item={item} />
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    )
}
