import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useEffect } from 'react'
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native'

import { colors } from '@/constants/colors'
import { FootageType } from '@/types/footageItem'

const { width } = Dimensions.get('window')

const MEDIA_ASPECT_RATIO = 16 / 9
const MEDIA_HEIGHT = width / MEDIA_ASPECT_RATIO

interface Props {
    uri?: string
    type?: FootageType
    isPlaying?: boolean
    onPlayPause?: () => void
}

export default function MainImage({
    uri,
    type = FootageType.PHOTO,
    isPlaying = false,
    onPlayPause,
}: Props) {
    const isVideo = type === FootageType.VIDEO

    const player = useVideoPlayer(uri ?? null, videoPlayer => {
        videoPlayer.loop = false
    })

    useEffect(() => {
        if (!isVideo || !uri) {
            return
        }

        if (isPlaying) {
            player.play()
            return
        }

        player.pause()
    }, [isPlaying, isVideo, player, uri])

    if (!uri) {
        return <View style={{ width, height: MEDIA_HEIGHT }} className="bg-surface-container-high" />
    }

    if (isVideo) {
        return (
            <View style={{ width, height: MEDIA_HEIGHT }} className="bg-black">
                <VideoView
                    player={player}
                    style={{ width, height: MEDIA_HEIGHT }}
                    contentFit="contain"
                    nativeControls={false}
                />

                <View className="absolute inset-0 items-center justify-center">
                    <TouchableOpacity
                        onPress={onPlayPause}
                        activeOpacity={0.85}
                        className="h-20 w-20 items-center justify-center rounded-full bg-primary/90"
                        accessibilityRole="button"
                        accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
                    >
                        <FontAwesomeIcon
                            icon={isPlaying ? faPause : faPlay}
                            size={30}
                            color={colors.onPrimary}
                        />
                        <Text className="mt-1 font-atkinson-semibold text-[13px] text-on-primary">
                            {isPlaying ? 'Pause' : 'Play'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={{ width, height: MEDIA_HEIGHT }} className="bg-surface-container-high">
            <Image source={{ uri }} style={{ width, height: MEDIA_HEIGHT }} resizeMode="cover" />
        </View>
    )
}
