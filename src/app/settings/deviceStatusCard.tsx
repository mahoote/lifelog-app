import { faExclamation, faGlasses, faWifi } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { colors } from '@/constants/colors'
import { getLifelogHealth } from '@/services/lifelogService'
import { connectionActions } from '@/store/connectionSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export default function DeviceStatusCard() {
    const dispatch = useAppDispatch()
    const wifiConnected = useAppSelector(state => state.connection.wifiConnected)

    const [refreshLoading, setRefreshLoading] = useState(false)

    /**
     * Fetches the current health of the lifelog api.
     * Sets the values to the store.
     */
    const handleRefresh = async () => {
        setRefreshLoading(true)

        const health = await getLifelogHealth()
        dispatch(connectionActions.setWifiConnected(health))
        setRefreshLoading(false)
    }

    return (
        <View className="rounded-lg bg-surface-container-high px-6 pb-6 pt-7">
            <View className="mb-8 flex-row items-center">
                {/*<Text className="font-atkinson-bold text-[15px] uppercase tracking-[1.2px] text-secondary">*/}
                {/*    Device Status*/}
                {/*</Text>*/}

                {wifiConnected ? (
                    <View className="flex-row items-center rounded bg-primary-container gap-2 px-3 py-2">
                        <FontAwesomeIcon icon={faWifi} size={12} color={colors.primary} />
                        <Text className="font-atkinson-semibold text-[15px] text-on-primary-container">
                            Connected
                        </Text>
                    </View>
                ) : (
                    <View className="flex-row items-center rounded bg-error-container gap-1 px-3 py-2">
                        <FontAwesomeIcon
                            icon={faExclamation}
                            size={12}
                            color={colors.onErrorContainer}
                        />
                        <Text className="font-atkinson-semibold text-[15px] text-on-error-container">
                            Not Connected
                        </Text>
                    </View>
                )}
            </View>

            <View className="items-center">
                <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-surface-dim">
                    <FontAwesomeIcon icon={faGlasses} size={30} color={colors.primary} />
                </View>

                <Text className="mb-2 text-center font-atkinson-bold text-[24px] leading-[30px] text-on-surface">
                    Lifelog Glasses
                </Text>

                {!wifiConnected && (
                    <>
                        <Text className="mb-5 max-w-[260px] text-center font-atkinson text-[18px] leading-[27px] text-on-surface-variant">
                            Connect to your glasses to sync today&apos;s memories.
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Connect to Glasses WiFi"
                            className="h-14 w-full flex-row gap-3 items-center justify-center rounded-full bg-primary px-5 active:bg-on-primary-container"
                            onPress={() => void handleRefresh()}
                        >
                            {refreshLoading ? (
                                <Text className="font-atkinson-bold text-[17px] text-on-primary">
                                    Connecting...
                                </Text>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faWifi} size={20} color={colors.onPrimary} />
                                    <Text className="font-atkinson-bold text-[17px] text-on-primary">
                                        Connect to Glasses WiFi
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </>
                )}
            </View>
        </View>
    )
}
