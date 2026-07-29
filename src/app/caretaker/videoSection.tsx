import { Text, View } from 'react-native'

import VideoCard from '@/app/caretaker/videoCard'
import { VideoGroup } from '@/types/video'

interface Props {
    group: VideoGroup
}

export default function VideoSection({ group }: Props) {
    return (
        <View>
            <Text className="mb-3 font-atkinson-bold text-[13px] uppercase tracking-[1.4px] text-secondary">
                {group.label}
            </Text>

            <View className="gap-3">
                {group.items.map(item => (
                    <VideoCard key={item.id} item={item} />
                ))}
            </View>
        </View>
    )
}
