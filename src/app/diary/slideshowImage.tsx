import { Image, Text, View } from 'react-native'

interface DiaryEntry {
    id: string
    title: string
    caption: string
    uri: string
    datetime: string
}

interface Props {
    entry: DiaryEntry
}

export default function SlideshowImage({ entry }: Props) {
    return (
        <View>
            <Text className="mb-4 font-atkinson-bold text-[13px] uppercase tracking-[1.4px] text-secondary">
                {entry.datetime}
            </Text>

            <View className="overflow-hidden rounded-xl">
                <Image
                    source={{ uri: entry.uri }}
                    className="w-full"
                    style={{ height: 320 }}
                    resizeMode="cover"
                />
            </View>

            <View className="mt-5">
                <Text className="font-atkinson-bold text-[24px] leading-[30px] text-on-surface">
                    {entry.title}
                </Text>
                <Text className="mt-2 font-atkinson text-[17px] leading-[25px] text-on-surface-variant">
                    {entry.caption}
                </Text>
            </View>
        </View>
    )
}
