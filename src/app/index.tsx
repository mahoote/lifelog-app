import BottomSheet from '@gorhom/bottom-sheet'
import { useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { AppButton } from '@/components/appButton'
import WifiDrawer from '@/components/wifiDrawer'

/**
 * Connection settings for the app and glasses.
 * Can set up the bluetooth connection and the Wi-Fi connection.
 * @constructor
 */
export default function Index() {
    const sheetRef = useRef<BottomSheet>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    return (
        <>
            <View className="gap-6 p-2">
                <View className="gap-2">
                    <Text className="text-xl">Glasses Bluetooth</Text>
                    <Text>Status: Not connected</Text>
                    <View className="gap-2 flex-row">
                        <AppButton title="Scan for glasses" />
                        <AppButton title="Connect to glasses" />
                    </View>
                </View>

                <View className="gap-2">
                    <Text className="text-xl">Glasses WiFi</Text>
                    <Text>Status: Not connected</Text>
                    <Text>SSID: ....</Text>
                    <Text>IP: ....</Text>
                    <View className="gap-2 flex-row">
                        <AppButton title="Refresh status" />
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
                    <Text>Devices connected to same WiFi:</Text>
                    <View className="pl-2">
                        <Text>• Phone: Eduroam</Text>
                        <Text>• Glasses: Eduroam</Text>
                    </View>
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
