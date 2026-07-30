import { useRouter } from 'expo-router'
import { useEffect, useMemo, useRef } from 'react'
import { Dimensions, Image, ScrollView, TouchableOpacity } from 'react-native'

import { useGalleryImages } from '@/hooks/useGalleryImages'

const THUMB_SIZE = 64
const THUMB_GAP = 6
const SIDE_PADDING = 16
const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface Props {
    dayKey: string | null
    selectedId: string | null
}

export default function ThumbnailStrip({ dayKey, selectedId }: Props) {
    const router = useRouter()
    const scrollRef = useRef<ScrollView>(null)

    const { data: images = [] } = useGalleryImages(dayKey)

    const selectedIndex = useMemo(() => {
        if (!selectedId) {
            return -1
        }

        return images.findIndex(item => item.id === selectedId)
    }, [images, selectedId])

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

    if (!dayKey || images.length === 0) {
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
            {images.map(item => {
                const isSelected = item.id === selectedId

                return (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.8}
                        onPress={() => {
                            router.replace({
                                pathname: '/footage',
                                params: {
                                    id: item.id,
                                },
                            })
                        }}
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
