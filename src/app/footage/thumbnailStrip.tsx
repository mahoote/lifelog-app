import { useEffect, useRef } from 'react'
import { Dimensions, Image, ScrollView, TouchableOpacity, View } from 'react-native'

const THUMB_SIZE = 64
const THUMB_GAP = 6
const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface FootageItem {
    id: string
    uri?: string
}

interface Props {
    items: FootageItem[]
    selectedIndex: number
    onSelect: (index: number) => void
}

export default function ThumbnailStrip({ items, selectedIndex, onSelect }: Props) {
    const scrollRef = useRef<ScrollView>(null)

    useEffect(() => {
        const offset = 16 + selectedIndex * (THUMB_SIZE + THUMB_GAP) - SCREEN_WIDTH / 2 + THUMB_SIZE / 2

        scrollRef.current?.scrollTo({ x: Math.max(0, offset), animated: true })
    }, [selectedIndex])

    return (
        <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                paddingHorizontal: 16,
                gap: THUMB_GAP,
                paddingVertical: 10,
            }}
            className="flex-grow-0"
        >
            {items.map((item, index) => {
                const isSelected = index === selectedIndex
                return (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.8}
                        onPress={() => onSelect(index)}
                        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                        className={`overflow-hidden rounded-md ${
                            isSelected ? 'border-2 border-primary' : 'border-2 border-transparent'
                        }`}
                    >
                        {item.uri ? (
                            <Image
                                source={{ uri: item.uri }}
                                style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                                resizeMode="cover"
                            />
                        ) : (
                            <View
                                style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                                className="bg-surface-container-highest"
                            />
                        )}
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
    )
}
