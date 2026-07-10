import BottomSheet from '@gorhom/bottom-sheet'
import { useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { AppButton } from '@/components/appButton'
import WifiDrawer from '@/components/wifiDrawer'
import { getLifelogHealth } from '@/services/lifelog-service'

/**
 * Connection settings for the app and glasses.
 * Can set up the bluetooth connection and the Wi-Fi connection.
 * @constructor
 */
export default function Index() {
    const sheetRef = useRef<BottomSheet>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
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
                        <AppButton
                            title="Connect to wifi"
                            onPress={() => {
                                setIsSheetOpen(true)
                                sheetRef.current?.expand()
                            }}
                        />
                    </View>
                </View>

                <View className="gap-2">
                    <Text>Devices connected to same WiFi</Text>
                </View>
            </View>

            <WifiDrawer
                sheetRef={sheetRef}
                isSheetOpen={isSheetOpen}
                onCloseSheet={() => setIsSheetOpen(false)}
            />
        </>
    )
}
