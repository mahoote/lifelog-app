import { useState } from 'react'
import { Text, View } from 'react-native'
import { AppButton } from '@/components/appButton'
import { getLifelogFootage, getLifelogHealth } from '@/services/lifelogService'
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
    const [processLoading, setProcessLoading] = useState(false)

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

    const handleProcessFootage = async () => {
        setProcessLoading(true)

        const footage = await getLifelogFootage()
        if (!footage.length) return

        setProcessLoading(false)
    }

    return (
        <>
            <View className="gap-6 p-2">
                <View className="gap-4">
                    <View className="gap-2">
                        <Text className="text-xl">Glasses</Text>
                        <Text>Status: {wifiConnected ? 'Connected through WiFi' : 'Not connected'}</Text>
                        {wifiConnected && (
                            <>
                                <Text>SSID: {wifiConnected.ssid}</Text>
                                <Text>IP: {wifiConnected.ip}</Text>
                            </>
                        )}
                        <AppButton
                            title="Refresh status"
                            onPress={() => void handleRefresh()}
                            loading={refreshLoading}
                        />
                    </View>
                    <View className="gap-2">
                        <Text className="text-xl">Actions</Text>
                        <AppButton
                            title="Process footage"
                            onPress={() => void handleProcessFootage()}
                            loading={processLoading}
                        />
                    </View>
                </View>
            </View>
        </>
    )
}
