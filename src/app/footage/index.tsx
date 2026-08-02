import { useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import FootageHeader from '@/app/footage/footageHeader'
import MainImage from '@/app/footage/mainImage'
import MomentDescription from '@/app/footage/momentDescription'
import ThumbnailStrip from '@/app/footage/thumbnailStrip'
import { useGalleryImages } from '@/hooks/useGalleryImages'
import { getFootageItemById } from '@/repositories/footageItemRepository'
import { FootageItem, FootageType } from '@/types/footageItem'

export default function FootageScreen() {
    const [current, setCurrent] = useState<FootageItem | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const { id, type } = useLocalSearchParams<{ id: string; type?: FootageType }>()
    const routeId = Array.isArray(id) ? (id[0] as string) : id
    const routeType = Array.isArray(type) ? (type[0] as FootageType | undefined) : type
    const footageType = routeType === FootageType.VIDEO ? FootageType.VIDEO : FootageType.PHOTO

    useEffect(() => {
        if (routeId) {
            setSelectedId(routeId)
        }
    }, [routeId])

    useEffect(() => {
        async function fetchFootageItem() {
            if (!selectedId) {
                setCurrent(null)
                return
            }

            const item = await getFootageItemById(selectedId)
            setCurrent(item)
        }

        void fetchFootageItem()
    }, [selectedId])

    const dayKey = current?.dayKey ?? null

    const { data: items = [] } = useGalleryImages(dayKey, footageType)

    const selectedIndex = useMemo(() => {
        if (!selectedId) {
            return -1
        }

        return items.findIndex(item => item.id === selectedId)
    }, [items, selectedId])

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <FootageHeader
                current={selectedIndex >= 0 ? selectedIndex + 1 : 0}
                total={items.length}
                date={dayKey ?? ''}
            />

            <View className="flex-1">
                <MainImage uri={current?.fileUri} />

                <ThumbnailStrip
                    dayKey={dayKey}
                    selectedId={selectedId}
                    type={footageType}
                    onSelect={setSelectedId}
                />

                <View className="mt-4 px-6">
                    <MomentDescription
                        title={footageType === FootageType.VIDEO ? 'Video' : 'Image'}
                        description={
                            (current?.description ?? footageType === FootageType.VIDEO)
                                ? 'This video is used only as context for the memory and does not have a description.'
                                : 'This image is used only as context for the memory and does not have a description.'
                        }
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}
