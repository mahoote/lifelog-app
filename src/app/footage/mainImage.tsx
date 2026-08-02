import { useVideoPlayer, VideoView } from 'expo-video'
import { useEffect } from 'react'
import { Dimensions, Image, View } from 'react-native'

import { FootageType } from '@/types/footageItem'

const { width } = Dimensions.get('window')

const MEDIA_ASPECT_RATIO = 16 / 9
const MEDIA_HEIGHT = width / MEDIA_ASPECT_RATIO

interface Props {
    uri?: string
    type?: FootageType
    isPlaying?: boolean
}

export default function MainImage({ uri, type = FootageType.PHOTO, isPlaying = false }: Props) {
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
            </View>
        )
    }

    return (
        <View style={{ width, height: MEDIA_HEIGHT }} className="bg-surface-container-high">
            <Image source={{ uri }} style={{ width, height: MEDIA_HEIGHT }} resizeMode="cover" />
        </View>
    )
}
