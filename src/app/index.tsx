import { useState } from 'react'
import { Text, View } from 'react-native'
import { AppButton } from '@/components/appButton'
import { getLifelogHealth } from '@/services/lifelog-service'
import { connectionActions } from '@/store/connectionSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

/**
 * Connection settings for the app and glasses.
 * Can set up the bluetooth connection and the Wi-Fi connection.
 * @constructor
 */
export default function Index() {
    const dispatch = useAppDispatch()
    const wifiConnected = useAppSelector(state => state.connection.wifiConnected)

    const [refreshLoading, setRefreshLoading] = useState(false)

    const handleRefresh = async () => {
        setRefreshLoading(true)

        const health = await getLifelogHealth()
        if (!health) return

        dispatch(connectionActions.setWifiConnected(health))
        setRefreshLoading(false)
    }

    return (
        <>
            <View className="gap-6 p-2">
                <View className="gap-2">
                    <Text className="text-xl">Glasses WiFi</Text>
                    <Text>Status: {wifiConnected ? 'Connected' : 'Not connected'}</Text>
                    {wifiConnected && (
                        <>
                            <Text>SSID: {wifiConnected.ssid}</Text>
                            <Text>IP: {wifiConnected.ip}</Text>
                        </>
                    )}
                    <View className="gap-2">
                        <AppButton
                            title="Refresh status"
                            onPress={() => void handleRefresh()}
                            loading={refreshLoading}
                        />
                    </View>
                </View>

                <View className="gap-2">
                    <Text>Devices connected to same WiFi</Text>
                </View>
            </View>
        </>
    )
}
