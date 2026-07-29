import { Text, useWindowDimensions, View } from 'react-native'
import ImageTile from '@/app/caretaker/imageTile'
import { ImageSectionProps, MediaItem } from '@/types/image'

export default function ImageSection({ title, items }: ImageSectionProps) {
    const { width } = useWindowDimensions()
    // px-8 = 32px each side, gap-2 = 8px between tiles, 2 gaps for 3 columns
    const tileSize = (width - 64 - 16) / 3

    const rows: MediaItem[][] = []
    for (let i = 0; i < items.length; i += 3) {
        rows.push(items.slice(i, i + 3))
    }

    return (
        <View>
            <Text className="mb-4 font-atkinson-bold text-[22px] leading-[28px] text-on-surface">
                {title}
            </Text>

            <View className="gap-2">
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row gap-2">
                        {row.map(item => (
                            <ImageTile key={item.id} item={item} size={tileSize} />
                        ))}
                    </View>
                ))}
            </View>
        </View>
    )
}
