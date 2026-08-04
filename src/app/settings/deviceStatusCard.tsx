import { faExclamation, faGlasses, faWifi } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'

import { colors } from '@/constants/colors'
import { getLifelogHealth } from '@/services/lifelogService'
import { connectionActions } from '@/store/connectionSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export default function DeviceStatusCard() {
    const dispatch = useAppDispatch()
    const wifiConnected = useAppSelector(state => state.connection.wifiConnected)
    const ipAddress = useAppSelector(state => state.connection.ipAddress)

    const [connectLoading, setConnectLoading] = useState(false)
    const [deviceIp, setDeviceIp] = useState(ipAddress || '')

    /**
     * Fetches the current health of the lifelog api.
     * Sets the values to the store.
     */
    const handleConnect = async () => {
        setConnectLoading(true)

        try {
            const trimmedDeviceIp = deviceIp.trim()

            dispatch(connectionActions.setIpAddress(trimmedDeviceIp))

            const health = await getLifelogHealth()

            if (!health) {
                dispatch(connectionActions.setWifiConnected(null))

                Alert.alert(
                    'Connection failed',
                    'Could not connect to the glasses. Check that the glasses are powered on, connected to WiFi, and using the correct IP address.',
                )

                return
            }

            dispatch(connectionActions.setWifiConnected(health))
        } catch (error) {
            console.error('Failed to connect to glasses:', error)

            dispatch(connectionActions.setWifiConnected(null))

            Alert.alert(
                'Connection error',
                'Something went wrong while trying to connect to the glasses. Please check the IP address and try again.',
            )
        } finally {
            setConnectLoading(false)
        }
    }

    return (
        <View className="rounded-lg bg-surface-container-high px-6 pb-6 pt-7">
            <View className="mb-8 flex-row items-center">
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

                        <View className="mb-4 w-full">
                            <Text className="mb-2 font-atkinson-bold text-[16px] text-on-surface">
                                Glasses IP address
                            </Text>
                            <TextInput
                                accessibilityLabel="Glasses IP address"
                                value={deviceIp}
                                onChangeText={setDeviceIp}
                                placeholder="Enter IP address"
                                placeholderTextColor={colors.onSurfaceVariant}
                                keyboardType="numbers-and-punctuation"
                                autoCapitalize="none"
                                autoCorrect={false}
                                className="h-14 w-full rounded-lg border-2 border-surface-container-highest bg-surface px-4 font-atkinson text-[17px] text-on-surface"
                            />
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Connect to Glasses WiFi"
                            className="h-14 w-full flex-row gap-3 items-center justify-center rounded-full bg-primary px-5 active:bg-on-primary-container disabled:opacity-60"
                            onPress={() => void handleConnect()}
                            disabled={connectLoading || deviceIp.trim().length === 0}
                        >
                            {connectLoading ? (
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
