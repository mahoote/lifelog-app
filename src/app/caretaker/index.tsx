import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ImageSection from '@/app/caretaker/imageSection'
import InfoBar from '@/app/caretaker/infoBar'
import MediaTabBar from '@/app/caretaker/mediaTabBar'
import SyncStatusBar from '@/app/caretaker/syncStatusBar'
import TimeOfDayFilter from '@/app/caretaker/timeOfDayFilter'
import VideoSection from '@/app/caretaker/videoSection'
import AppHeader from '@/components/appHeader'
import DateFilterRow from '@/components/dateFilterRow'
import { TimeFilter } from '@/types/filter'
import { MediaItem } from '@/types/image'
import { MediaTab } from '@/types/media'
import { VideoGroup } from '@/types/video'

const morningItems: MediaItem[] = [
    { id: '1', time: '09:15 AM', badge: 'verified', uri: 'https://picsum.photos/seed/a1/200/200' },
    { id: '2', time: '10:30 AM', badge: 'flagged', uri: 'https://picsum.photos/seed/a2/200/200' },
    { id: '3', time: '11:00 AM', badge: 'none', uri: 'https://picsum.photos/seed/a3/200/200' },
    { id: '4', time: '', badge: 'processing' },
]

const afternoonItems: MediaItem[] = [
    { id: '5', time: '', badge: 'none', uri: 'https://picsum.photos/seed/b1/200/200' },
    { id: '6', time: '', badge: 'none', uri: 'https://picsum.photos/seed/b2/200/200' },
    { id: '7', time: '', badge: 'none', uri: 'https://picsum.photos/seed/b3/200/200' },
    { id: '8', time: '', badge: 'none', uri: 'https://picsum.photos/seed/b4/200/200' },
    { id: '9', time: '', badge: 'none', uri: 'https://picsum.photos/seed/b5/200/200' },
    { id: '10', time: '', badge: 'none', overflow: 3 },
]

const videoGroups: VideoGroup[] = [
    {
        label: 'Morning',
        items: [
            {
                id: 'v1',
                title: 'Morning Reading',
                time: '10:15 AM',
                location: 'South Lounge',
                activity: 'Resting',
                uri: 'https://picsum.photos/seed/v1/200/200',
            },
        ],
    },
    {
        label: 'Afternoon',
        items: [
            {
                id: 'v2',
                title: 'Lunch Preparation',
                time: '12:30 PM',
                location: 'Kitchen',
                activity: 'Social',
                uri: 'https://picsum.photos/seed/v2/200/200',
            },
            {
                id: 'v3',
                title: 'Garden Walk',
                time: '3:45 PM',
                location: 'East Garden',
                activity: 'Mobility',
                uri: 'https://picsum.photos/seed/v3/200/200',
            },
        ],
    },
]

export default function CaretakerScreen() {
    const [activeTab, setActiveTab] = useState<MediaTab>('images')
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <ScrollView
                className="flex-1"
                contentContainerClassName="pb-10"
                showsVerticalScrollIndicator={false}
            >
                <View className="px-8 pt-2">
                    <AppHeader title="Caretaker" />
                </View>

                <View className="mt-6 px-8">
                    <MediaTabBar activeTab={activeTab} onTabPress={setActiveTab} />
                </View>

                <View className="mt-4 px-8">
                    <SyncStatusBar />
                </View>

                <View className="mt-4 px-8">
                    <DateFilterRow />
                </View>

                <View className="mt-4 px-8">
                    <TimeOfDayFilter activeFilter={timeFilter} onFilterChange={setTimeFilter} />
                </View>

                {activeTab === 'images' ? (
                    <>
                        <View className="mt-7 px-8">
                            <ImageSection title="Morning" items={morningItems} />
                        </View>

                        <View className="mt-8 px-8">
                            <ImageSection title="Afternoon" items={afternoonItems} />
                        </View>
                    </>
                ) : (
                    <>
                        <View className="mt-6 px-8">
                            <InfoBar />
                        </View>

                        <View className="mt-6 px-8 gap-7">
                            {videoGroups.map(group => (
                                <VideoSection key={group.label} group={group} />
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
