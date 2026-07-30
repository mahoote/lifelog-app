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
import { MediaTab } from '@/types/media'
import { VideoGroup } from '@/types/video'

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
                contentContainerClassName="pb-10 px-8 gap-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="pt-2">
                    <AppHeader title="Caretaker" />
                </View>

                <View className="mt-2">
                    <MediaTabBar activeTab={activeTab} onTabPress={setActiveTab} />
                </View>

                <SyncStatusBar />

                <DateFilterRow />

                <TimeOfDayFilter activeFilter={timeFilter} onFilterChange={setTimeFilter} />

                {activeTab === 'images' ? (
                    <View className="mt-1">
                        <ImageSection />
                    </View>
                ) : (
                    <>
                        <View className="mt-2">
                            <InfoBar />
                        </View>

                        <View className="mt-2 gap-7">
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
