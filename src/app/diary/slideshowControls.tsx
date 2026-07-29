import { faBackwardStep, faForwardStep, faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Text, TouchableOpacity, View } from 'react-native'

import { colors } from '@/constants/colors'

interface Props {
    isPlaying: boolean
    onBack: () => void
    onPlayPause: () => void
    onNext: () => void
}

export default function SlideshowControls({ isPlaying, onBack, onPlayPause, onNext }: Props) {
    return (
        <View className="flex-row items-center gap-3">
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onBack}
                className="h-16 flex-1 items-center justify-center gap-1 rounded-lg bg-secondary-container"
            >
                <FontAwesomeIcon icon={faBackwardStep} size={20} color={colors.primary} />
                <Text className="font-atkinson-semibold text-[15px] text-primary">Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPlayPause}
                className="h-16 flex-[2] items-center justify-center gap-1 rounded-lg bg-primary"
            >
                <FontAwesomeIcon
                    icon={isPlaying ? faPause : faPlay}
                    size={20}
                    color={colors.onPrimary}
                />
                <Text className="font-atkinson-bold text-[15px] text-on-primary">
                    {isPlaying ? 'Pause' : 'Play'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onNext}
                className="h-16 flex-1 items-center justify-center gap-1 rounded-lg bg-secondary-container"
            >
                <FontAwesomeIcon icon={faForwardStep} size={20} color={colors.primary} />
                <Text className="font-atkinson-semibold text-[15px] text-primary">Next</Text>
            </TouchableOpacity>
        </View>
    )
}
