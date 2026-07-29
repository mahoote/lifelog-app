import { faExclamation, faGlasses, faWifi } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Pressable, Text, View } from 'react-native'
import { colors } from '@/constants/colors'

export default function DeviceStatusCard() {
    return (
        <View className="rounded-lg bg-surface-container-high px-6 pb-6 pt-7">
            <View className="mb-8 flex-row items-center">
                {/*<Text className="font-atkinson-bold text-[15px] uppercase tracking-[1.2px] text-secondary">*/}
                {/*    Device Status*/}
                {/*</Text>*/}

                <View className="flex-row items-center rounded-full bg-error-container gap-1 px-3 py-2">
                    <FontAwesomeIcon icon={faExclamation} size={12} color={colors.onErrorContainer} />
                    <Text className="font-atkinson-semibold text-[15px] text-on-error-container">
                        Not Connected
                    </Text>
                </View>
            </View>

            <View className="items-center">
                <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-surface-dim">
                    <FontAwesomeIcon icon={faGlasses} size={30} color={colors.primary} />
                </View>

                <Text className="mb-2 text-center font-atkinson-bold text-[24px] leading-[30px] text-on-surface">
                    Lifelog Glasses
                </Text>

                <Text className="mb-5 max-w-[260px] text-center font-atkinson text-[18px] leading-[27px] text-on-surface-variant">
                    Connect to your glasses to sync today&apos;s memories.
                </Text>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Connect to Glasses WiFi"
                    className="h-14 w-full flex-row gap-3 items-center justify-center rounded-full bg-primary px-5 active:bg-on-primary-container"
                >
                    <FontAwesomeIcon icon={faWifi} size={20} color={colors.onPrimary} />
                    <Text className="font-atkinson-bold text-[17px] text-on-primary">
                        Connect to Glasses WiFi
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}
