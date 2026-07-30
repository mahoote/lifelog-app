import { useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import FootageHeader from '@/app/footage/footageHeader'
import MainImage from '@/app/footage/mainImage'
import MomentDescription from '@/app/footage/momentDescription'
import ThumbnailStrip from '@/app/footage/thumbnailStrip'

interface FootageItem {
    id: string
    uri?: string
    title: string
    description: string
}

const items: FootageItem[] = [
    {
        id: '1',
        title: 'Morning Tea',
        description: 'A calm start with a warm cup.',
        uri: 'https://picsum.photos/seed/f1/600/600',
    },
    {
        id: '2',
        title: 'Garden Walk',
        description: 'Enjoying the flower beds.',
        uri: 'https://picsum.photos/seed/f2/600/600',
    },
    {
        id: '3',
        title: 'Morning Tea',
        description: 'More descriptive text about the image',
        uri: 'https://picsum.photos/seed/f3/600/600',
    },
    {
        id: '4',
        title: 'Reading Corner',
        description: 'Quiet time with a book.',
        uri: 'https://picsum.photos/seed/f4/600/600',
    },
    {
        id: '5',
        title: 'Lunch Prep',
        description: 'Helping in the kitchen.',
        uri: 'https://picsum.photos/seed/f5/600/600',
    },
    {
        id: '6',
        title: 'Afternoon Rest',
        description: 'A peaceful nap by the window.',
        uri: 'https://picsum.photos/seed/f6/600/600',
    },
    {
        id: '7',
        title: 'Evening News',
        description: 'Watching the evening broadcast.',
        uri: 'https://picsum.photos/seed/f7/600/600',
    },
]

export default function FootageScreen() {
    const [selectedIndex, setSelectedIndex] = useState(2)
    const current = items[selectedIndex]

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <FootageHeader
                current={selectedIndex + 1}
                total={items.length}
                date="Monday, 29 July 2024"
            />

            <View className="flex-1">
                <MainImage uri={current.uri} />

                <ThumbnailStrip
                    items={items}
                    selectedIndex={selectedIndex}
                    onSelect={setSelectedIndex}
                />

                <View className="mt-4 px-6">
                    <MomentDescription title={current.title} description={current.description} />
                </View>
            </View>
        </SafeAreaView>
    )
}
