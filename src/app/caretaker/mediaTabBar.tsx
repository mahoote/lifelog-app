import { faImage, faVideo } from '@fortawesome/free-solid-svg-icons'
import { Dispatch, SetStateAction } from 'react'
import { View } from 'react-native'
import TabPill from '@/components/tabPill'
import { MediaTab } from '@/types/media'

interface Props {
    activeTab: MediaTab
    onTabPress: Dispatch<SetStateAction<MediaTab>>
}

export default function MediaTabBar({ activeTab, onTabPress }: Props) {
    return (
        <View className="flex-row rounded-full bg-surface-container-high p-1">
            <TabPill
                label="Images"
                icon={faImage}
                isActive={activeTab === 'images'}
                onPress={() => {
                    onTabPress('images')
                }}
            />
            <TabPill
                label="Videos"
                icon={faVideo}
                isActive={activeTab === 'videos'}
                onPress={() => {
                    onTabPress('videos')
                }}
            />
        </View>
    )
}
