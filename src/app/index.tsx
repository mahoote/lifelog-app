import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { AppButton } from '@/components/appButton'

const wifiNetworks = ['Home WiFi', 'Pixel_1234', 'Martin Router', 'UniFi Guest']

export default function Index() {
    const sheetRef = useRef<BottomSheet>(null)
    const [selectedWifi, setSelectedWifi] = useState<string | null>(null)

    return (
        <>
            <View className="gap-4 p-2">
                <View className="gap-2">
                    <Text className="text-xl">Glasses Bluetooth</Text>
                    <Text>Status: Not connected</Text>
                    <View className="gap-2">
                        <AppButton title="Scan for glasses" />
                        <AppButton title="Connect to glasses" />
                    </View>
                </View>

                <View className="gap-2">
                    <Text className="text-xl">Glasses WiFi</Text>
                    <Text>Status: Not connected</Text>
                    <Text>SSID: ....</Text>
                    <Text>IP: ....</Text>
                    <View className="gap-2">
                        <AppButton title="Refresh status" />
                        <AppButton
                            title="Connect to wifi"
                            onPress={() => {
                                sheetRef.current?.snapToIndex(0)
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

            <BottomSheet ref={sheetRef} index={-1}>
                <View className="gap-4 p-4">
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
                            sheetRef.current?.snapToIndex(-1)
                        }}
                    />
                </View>
            </BottomSheet>
        </>
    )
}
