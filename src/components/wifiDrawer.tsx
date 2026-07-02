import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/src/types'
import { RefObject, useState } from 'react'
import { Pressable, View, Text } from 'react-native'
import { AppButton } from '@/components/appButton'

interface Props {
    sheetRef: RefObject<BottomSheetMethods | null>
    onCloseSheet: () => void
}

const wifiNetworks = ['Home WiFi', 'Pixel_1234', 'Martin Router', 'UniFi Guest']

/**
 * A gorhom bottom drawer.
 * Lists all the available networks the glasses can connect to.
 * When selecting a Wi-Fi, type in the password and press connect.
 * @param param0 - Props
 * @param param0.sheetRef - Used to open and close the sheet.
 * @param param0.onCloseSheet - Used to set the closed state of the sheet.
 * @constructor
 */
export default function WifiDrawer({ sheetRef, onCloseSheet }: Props) {
    const [selectedWifi, setSelectedWifi] = useState<string | null>(null)

    return (
        <BottomSheet
            ref={sheetRef}
            index={-1}
            enablePanDownToClose
            onClose={onCloseSheet}
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
    )
}
