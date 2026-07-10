import { useState } from 'react'
import { Text, View } from 'react-native'
import { AppButton } from '@/components/appButton'
import { getLifelogHealth } from '@/services/lifelog-service'

/**
 * Connection settings for the app and glasses.
 * Can set up the bluetooth connection and the Wi-Fi connection.
 * @constructor
 */
export default function Index() {
    const [hasConnection, setHasConnection] = useState(false)
    const [refreshLoading, setRefreshLoading] = useState(false)

    const handleRefresh = async () => {
        setRefreshLoading(true)

        const health = await getLifelogHealth()
        if (!health) return

        setHasConnection(true)
        setRefreshLoading(false)
    }

    return (
        <>
            <View className="gap-6 p-2">
                <View className="gap-2">
                    <Text className="text-xl">Glasses WiFi</Text>
                    <Text>Status: {hasConnection ? 'Connected' : 'Not connected'}</Text>
                    <Text>SSID: ....</Text>
                    <Text>IP: ....</Text>
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
