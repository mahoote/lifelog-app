import { Button, Text, View } from 'react-native'

export default function Index() {
    return (
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
                    <Button title="Connect to wifi" />
                </View>
            </View>

            <View className="gap-2">
                <Text>Devices connected to same WiFi</Text>
                {/*<ul>*/}
                {/*    <li>Phone: Eduroam</li>*/}
                {/*    <li>Glasses: Eduroam</li>*/}
                {/*</ul>*/}
            </View>
        </View>
    )
}
