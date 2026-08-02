import { useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { DateOption } from '@/app'
import DatePicker from '@/app/diary/datePicker'
import SlideshowControls from '@/app/diary/slideshowControls'
import SlideshowImage from '@/app/diary/slideshowImage'
import SlideSpeedSelector from '@/app/diary/slideSpeedSelector'
import AppHeader from '@/components/appHeader'
import { mapFootageItemToDiaryEntry } from '@/mappers/footageMapper'
import { getSelectedFootageItemsForDay } from '@/repositories/footageItemRepository'
import { getGalleryDays } from '@/repositories/galleryDayRepository'
import { DiaryEntry } from '@/types/diary'
import { formatDateOption } from '@/utils/dateUtils'

type SlideSpeed = 'slow' | 'medium' | 'fast'

const speedSeconds: Record<SlideSpeed, number> = {
    slow: 20,
    medium: 10,
    fast: 5,
}

export default function DiaryScreen() {
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [dateOptions, setDateOptions] = useState<DateOption[]>([])
    const [entries, setEntries] = useState<DiaryEntry[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speed, setSpeed] = useState<SlideSpeed>('medium')
    const [isLoading, setIsLoading] = useState(true)

    const currentEntry = entries[currentIndex]
    const hasEntries = entries.length > 0

    useEffect(() => {
        let isMounted = true

        async function loadDays() {
            const days = await getGalleryDays()
            const options = days.map(formatDateOption)

            if (!isMounted) return

            setDateOptions(options)
            setSelectedDate(current => current ?? options[0]?.id ?? null)
        }

        loadDays().catch(error => {
            console.error('Failed to load diary days', error)
            if (isMounted) setDateOptions([])
        })

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        async function loadEntries() {
            if (!selectedDate) {
                setEntries([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)

            const selectedItems = await getSelectedFootageItemsForDay(selectedDate)
            const nextEntries = selectedItems.map(mapFootageItemToDiaryEntry)

            if (!isMounted) return

            setEntries(nextEntries)
            setCurrentIndex(0)
            setIsPlaying(false)
            setIsLoading(false)
        }

        loadEntries().catch(error => {
            console.error('Failed to load selected diary images', error)
            if (!isMounted) return

            setEntries([])
            setCurrentIndex(0)
            setIsPlaying(false)
            setIsLoading(false)
        })

        return () => {
            isMounted = false
        }
    }, [selectedDate])

    const emptyMessage = useMemo(() => {
        if (isLoading) return 'Loading selected images...'
        if (dateOptions.length === 0) return 'No diary days found yet.'
        return 'No selected images found for this day.'
    }, [dateOptions.length, isLoading])

    const handleBack = () => {
        if (!hasEntries) return
        setCurrentIndex(i => (i > 0 ? i - 1 : entries.length - 1))
    }

    const handleNext = () => {
        if (!hasEntries) return
        setCurrentIndex(i => (i < entries.length - 1 ? i + 1 : 0))
    }

    useEffect(() => {
        if (!isPlaying || !hasEntries) return

        const interval = setInterval(() => {
            setCurrentIndex(i => (i < entries.length - 1 ? i + 1 : 0))
        }, speedSeconds[speed] * 1000)

        return () => clearInterval(interval)
    }, [entries.length, hasEntries, isPlaying, speed])

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <ScrollView
                className="flex-1"
                contentContainerClassName="pb-10"
                showsVerticalScrollIndicator={false}
            >
                <View className="px-8 pt-2">
                    <AppHeader title="Diary" />
                </View>

                <View className="mt-6 px-8">
                    <DatePicker
                        options={dateOptions}
                        selectedId={selectedDate ?? ''}
                        onSelect={setSelectedDate}
                    />
                </View>

                {currentEntry ? (
                    <>
                        <View className="mt-6 px-8">
                            <Text className="font-atkinson">{entries.length} images</Text>
                            <SlideshowImage entry={currentEntry} />
                        </View>

                        <View className="mt-6 px-8">
                            <SlideshowControls
                                isPlaying={isPlaying}
                                onBack={handleBack}
                                onPlayPause={() => setIsPlaying(v => !v)}
                                onNext={handleNext}
                            />
                        </View>

                        <View className="mt-5 px-8">
                            <SlideSpeedSelector speed={speed} onSpeedChange={setSpeed} />
                        </View>
                    </>
                ) : (
                    <View className="mx-8 mt-6 rounded-xl bg-surface-container-high p-6">
                        <Text className="font-atkinson text-[17px] leading-[25px] text-on-surface-variant">
                            {emptyMessage}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
