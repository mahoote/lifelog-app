import { faImage, faVideo } from '@fortawesome/free-solid-svg-icons'
import { View } from 'react-native'
import TabPill from '@/app/caretaker/tabPill'
import { MediaTab } from '@/types/media'

interface Props {
    activeTab: MediaTab
    onTabChange: (tab: MediaTab) => void
}

export default function MediaTabBar({ activeTab, onTabChange }: Props) {
    return (
        <View className="flex-row rounded-full bg-surface-container-high p-1">
            <TabPill
                label="Images"
                icon={faImage}
                active={activeTab === 'images'}
                onPress={() => onTabChange('images')}
            />
            <TabPill
                label="Videos"
                icon={faVideo}
                active={activeTab === 'videos'}
                onPress={() => onTabChange('videos')}
            />
        </View>
    )
}
