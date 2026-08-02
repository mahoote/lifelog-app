import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ImageSection from '@/app/caretaker/imageSection'
import MediaTabBar from '@/app/caretaker/mediaTabBar'
import SyncStatusBar from '@/app/caretaker/syncStatusBar'
import VideoSection from '@/app/caretaker/videoSection'
import AppHeader from '@/components/appHeader'
import DateFilterRow from '@/components/dateFilterRow'
import { MediaTab } from '@/types/media'

export default function CaretakerScreen() {
    const [activeTab, setActiveTab] = useState<MediaTab>('images')
    // const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <ScrollView
                className="flex-1"
                contentContainerClassName="pb-10 px-8 gap-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="pt-2">
                    <AppHeader title="Caretaker" variant="caretaker" />
                </View>

                <View className="mt-2">
                    <MediaTabBar activeTab={activeTab} onTabPress={setActiveTab} />
                </View>

                <SyncStatusBar />

                <DateFilterRow />

                {/*<TimeOfDayFilter activeFilter={timeFilter} onFilterChange={setTimeFilter} />*/}

                {activeTab === 'images' ? (
                    <View className="mt-1">
                        <ImageSection />
                    </View>
                ) : (
                    <View className="mt-1">
                        <VideoSection />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
