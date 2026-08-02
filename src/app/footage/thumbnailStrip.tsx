import { useEffect, useMemo, useRef } from 'react'
import { Dimensions, Image, ScrollView, TouchableOpacity } from 'react-native'

import { useGalleryImages } from '@/hooks/useGalleryImages'
import { FootageType } from '@/types/footageItem'

const THUMB_SIZE = 64
const THUMB_GAP = 6
const SIDE_PADDING = 16
const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface Props {
    dayKey: string | null
    selectedId: string | null
    type?: FootageType
    onSelect: (id: string) => void
}

export default function ThumbnailStrip({
    dayKey,
    selectedId,
    type = FootageType.PHOTO,
    onSelect,
}: Props) {
    const scrollRef = useRef<ScrollView>(null)

    const { data: items = [] } = useGalleryImages(dayKey, type)

    const selectedIndex = useMemo(() => {
        if (!selectedId) {
            return -1
        }

        return items.findIndex(item => item.id === selectedId)
    }, [items, selectedId])

    useEffect(() => {
        if (selectedIndex < 0) {
            return
        }

        const offset =
            SIDE_PADDING + selectedIndex * (THUMB_SIZE + THUMB_GAP) - SCREEN_WIDTH / 2 + THUMB_SIZE / 2

        requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({
                x: Math.max(0, offset),
                animated: true,
            })
        })
    }, [selectedIndex])

    if (!dayKey || items.length === 0) {
        return null
    }

    return (
        <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                paddingHorizontal: SIDE_PADDING,
                gap: THUMB_GAP,
                paddingVertical: 10,
            }}
            className="flex-grow-0"
        >
            {items.map(item => {
                const isSelected = item.id === selectedId

                return (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.8}
                        onPress={() => onSelect(item.id!)}
                        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                        className={`overflow-hidden rounded-md ${
                            isSelected ? 'border-2 border-primary' : 'border-2 border-transparent'
                        }`}
                    >
                        <Image
                            source={{ uri: item.fileUri }}
                            style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
    )
}
