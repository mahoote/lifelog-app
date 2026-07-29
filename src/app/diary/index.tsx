import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import DatePicker from '@/app/diary/datePicker'
import SlideshowControls from '@/app/diary/slideshowControls'
import SlideshowImage from '@/app/diary/slideshowImage'
import SlideSpeedSelector from '@/app/diary/slideSpeedSelector'
import AppHeader from '@/components/appHeader'

type SlideSpeed = 'slow' | 'medium' | 'fast'

interface DiaryEntry {
    id: string
    title: string
    caption: string
    uri: string
    datetime: string
}

interface DateOption {
    id: string
    label: string
    day: number
    month: string
}

const speedSeconds: Record<SlideSpeed, number> = {
    slow: 20,
    medium: 10,
    fast: 5,
}

const dateOptions: DateOption[] = [
    { id: 'today', label: 'Today', day: 29, month: 'July' },
    { id: 'sun', label: 'Sun', day: 28, month: 'July' },
    { id: 'sat', label: 'Sat', day: 27, month: 'July' },
    { id: 'fri', label: 'Fri', day: 26, month: 'July' },
]

const entries: DiaryEntry[] = [
    {
        id: '1',
        title: 'The Garden in Summer',
        caption: 'A beautiful afternoon with Barnaby.',
        uri: 'https://picsum.photos/seed/garden/600/500',
        datetime: 'Monday, 29 July 2024 • 2:30 PM',
    },
    {
        id: '2',
        title: 'Morning Coffee',
        caption: 'A quiet start to the day.',
        uri: 'https://picsum.photos/seed/coffee/600/500',
        datetime: 'Monday, 29 July 2024 • 9:00 AM',
    },
    {
        id: '3',
        title: 'Afternoon Walk',
        caption: 'Fresh air along the riverside.',
        uri: 'https://picsum.photos/seed/walk/600/500',
        datetime: 'Monday, 29 July 2024 • 3:15 PM',
    },
]

export default function DiaryScreen() {
    const [selectedDate, setSelectedDate] = useState('today')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speed, setSpeed] = useState<SlideSpeed>('medium')

    const currentEntry = entries[currentIndex]

    const handleBack = () => {
        setCurrentIndex(i => (i > 0 ? i - 1 : entries.length - 1))
    }

    const handleNext = () => {
        setCurrentIndex(i => (i < entries.length - 1 ? i + 1 : 0))
    }

    useEffect(() => {
        if (!isPlaying) return

        const interval = setInterval(() => {
            setCurrentIndex(i => (i < entries.length - 1 ? i + 1 : 0))
        }, speedSeconds[speed] * 1000)

        return () => clearInterval(interval)
    }, [isPlaying, speed])

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
                        selectedId={selectedDate}
                        onSelect={setSelectedDate}
                    />
                </View>

                <View className="mt-6 px-8">
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
            </ScrollView>
        </SafeAreaView>
    )
}
