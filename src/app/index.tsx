import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { AppButton } from '@/components/appButton'

const wifiNetworks = ['Home WiFi', 'Pixel_1234', 'Martin Router', 'UniFi Guest']

export default function Index() {
    const sheetRef = useRef<BottomSheet>(null)
    const [selectedWifi, setSelectedWifi] = useState<string | null>(null)
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

            {isSheetOpen && (
                <Pressable
                    onPress={() => {
                        sheetRef.current?.close()
                    }}
                    className="absolute inset-0 bg-black/50"
                />
            )}
            <BottomSheet
                ref={sheetRef}
                index={-1}
                enablePanDownToClose
                onClose={() => setIsSheetOpen(false)}
            >
                <BottomSheetView className="gap-4 p-4">
                    <Text>Connect glasses to the WiFi your phone uses.</Text>

                    <View className="gap-2">
                        {wifiNetworks.map(wifiName => {
                            const isSelected = selectedWifi === wifiName

                            return (
                                <Pressable
                                    key={wifiName}
                                    onPress={() => {
                                        setSelectedWifi(wifiName)
                                    }}
                                    className="p-2"
                                >
                                    <Text>
                                        {isSelected && '✓ '}
                                        {wifiName}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </View>

                    <AppButton
                        title="Connect"
                        onPress={() => {
                            sheetRef.current?.close()
                        }}
                    />
                </BottomSheetView>
            </BottomSheet>
        </>
    )
}
