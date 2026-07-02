import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useRef, useState } from 'react'
import { Button, Pressable, Text, View } from 'react-native'

const wifiNetworks = ['Home WiFi', 'Pixel_1234', 'Martin Router', 'UniFi Guest']

export default function Index() {
    const sheetRef = useRef<BottomSheet>(null)
    const [selectedWifi, setSelectedWifi] = useState<string | null>(null)

    return (
        <>
            <BottomSheet ref={sheetRef} index={-1}>
                <View className="gap-4 p-2">
                    <Text>Connect glasses to the WiFi your phone uses.</Text>
                    <View className="gap-1">
                        {wifiNetworks.map((wifiName, index) => {
                            const isSelected = selectedWifi === wifiName

                            return (
                                <Pressable
                                    key={index}
                                    onPress={() => {
                                        setSelectedWifi(wifiName)
                                    }}
                                    className="p-1"
                                >
                                    <Text>
                                        {isSelected && '✓ '}
                                        {wifiName}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </View>
                    <Button
                        title="Connect to WiFi"
                        onPress={() => {
                            sheetRef.current?.close()
                        }}
                    />
                </View>
            </BottomSheet>
            <View className="gap-4 p-2">
                <View className="gap-2">
                    <Text className="text-xl">Glasses Bluetooth</Text>
                    <Text>Status: Not connected</Text>
                    <View className="gap-2">
                        <Button title="Scan for glasses" />
                        <Button title="Connect to glasses" />
                    </View>
                </View>

                <View className="gap-2">
                    <Text className="text-xl">Glasses WiFi</Text>
                    <Text>Status: Not connected</Text>
                    <Text>SSID: ....</Text>
                    <Text>IP: ....</Text>
                    <View className="gap-2">
                        <Button title="Refresh status" />
                        <Button
                            title="Connect to wifi"
                            onPress={() => {
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
        </>
    )
}
