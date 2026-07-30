import { faGaugeHigh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Text, TouchableOpacity, View } from 'react-native'

import { colors } from '@/constants/colors'

type SlideSpeed = 'slow' | 'medium' | 'fast'

const speedOptions: { id: SlideSpeed; label: string; seconds: number }[] = [
    { id: 'slow', label: 'Slow', seconds: 20 },
    { id: 'medium', label: 'Medium', seconds: 10 },
    { id: 'fast', label: 'Fast', seconds: 5 },
]

interface Props {
    speed: SlideSpeed
    onSpeedChange: (speed: SlideSpeed) => void
}

export default function SlideSpeedSelector({ speed, onSpeedChange }: Props) {
    return (
        <View className="rounded-xl bg-surface-container-low px-5 py-5">
            <View className="mb-4 flex-row items-center gap-2">
                <FontAwesomeIcon icon={faGaugeHigh} size={16} color={colors.onSurfaceVariant} />
                <Text className="font-atkinson-semibold text-[17px] text-on-surface">Slide Speed</Text>
            </View>

            <View className="flex-row gap-2">
                {speedOptions.map(option => {
                    const isActive = option.id === speed
                    return (
                        <TouchableOpacity
                            key={option.id}
                            activeOpacity={0.8}
                            onPress={() => onSpeedChange(option.id)}
                            className={`flex-1 items-center rounded-lg py-3 ${
                                isActive ? 'bg-primary' : 'bg-surface'
                            }`}
                        >
                            <Text
                                className={`font-atkinson-semibold text-[16px] ${
                                    isActive ? 'text-on-primary' : 'text-on-surface-variant'
                                }`}
                            >
                                {option.label}
                            </Text>
                            <Text className={isActive ? 'text-on-primary' : 'text-on-surface-variant'}>
                                {option.seconds}s
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}
