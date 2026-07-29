import { useEffect, useRef } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'

interface DateOption {
    id: string
    label: string
    day: number
    month: string
}

interface Props {
    options: DateOption[]
    selectedId: string
    onSelect: (id: string) => void
}

export default function DatePicker({ options, selectedId, onSelect }: Props) {
    const scrollRef = useRef<ScrollView>(null)

    useEffect(() => {
        scrollRef.current?.scrollToEnd({ animated: false })
    }, [])

    // Reverse so oldest is on the left, newest is on the right
    const sorted = [...options].reverse()

    return (
        <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row gap-3"
        >
            {sorted.map(option => {
                const isActive = option.id === selectedId
                return (
                    <TouchableOpacity
                        key={option.id}
                        activeOpacity={0.8}
                        onPress={() => onSelect(option.id)}
                        className={`w-24 items-center rounded-lg px-4 py-5 ${
                            isActive ? 'bg-primary' : 'bg-surface-container-high'
                        }`}
                    >
                        <Text
                            className={`font-atkinson-semibold text-[14px] leading-[18px] ${
                                isActive ? 'text-on-primary' : 'text-on-surface-variant'
                            }`}
                        >
                            {option.label}
                        </Text>
                        <Text
                            className={`font-atkinson-bold text-[32px] leading-[38px] ${
                                isActive ? 'text-on-primary' : 'text-on-surface'
                            }`}
                        >
                            {option.day}
                        </Text>
                        <Text
                            className={`font-atkinson text-[14px] leading-[18px] ${
                                isActive ? 'text-on-primary' : 'text-on-surface-variant'
                            }`}
                        >
                            {option.month}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
    )
}
