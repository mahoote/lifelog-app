import { Text, View } from 'react-native'

interface Props {
    title: string
    description: string
}

export default function MomentDescription({ title, description }: Props) {
    return (
        <View className="rounded-xl bg-surface-container-low px-5 py-5">
            <Text className="mb-2 font-atkinson-bold text-[12px] uppercase tracking-[1.4px] text-secondary">
                Moment Description
            </Text>
            <Text className="mb-1 font-atkinson-bold text-[20px] leading-[26px] text-on-surface">
                {title}
            </Text>
            <Text className="font-atkinson text-[16px] leading-[24px] text-on-surface-variant">
                {description}
            </Text>
        </View>
    )
}
