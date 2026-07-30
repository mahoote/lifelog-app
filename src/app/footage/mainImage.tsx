import { Dimensions, Image, View } from 'react-native'

const { width } = Dimensions.get('window')

const IMAGE_ASPECT_RATIO = 16 / 9
const IMAGE_HEIGHT = width / IMAGE_ASPECT_RATIO

interface Props {
    uri?: string
}

export default function MainImage({ uri }: Props) {
    return (
        <View
            style={{ height: IMAGE_HEIGHT }}
            className="w-full items-center justify-center bg-surface-container-high"
        >
            {uri ? (
                <Image source={{ uri }} style={{ width, height: IMAGE_HEIGHT }} resizeMode="contain" />
            ) : (
                <View className="flex-1 items-center justify-center bg-surface-container-highest" />
            )}
        </View>
    )
}
