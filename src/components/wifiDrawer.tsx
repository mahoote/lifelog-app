import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/src/types'
import { RefObject } from 'react'
import { Pressable, View, Text } from 'react-native'
import { AppButton } from '@/components/appButton'
import { connectionActions } from '@/store/connectionSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

function WifiListComponent() {
    const dispatch = useAppDispatch()
    const selectedWifi = useAppSelector(state => state.connection.selectedWifi)

    return (
        <View className="gap-2">
            {wifiNetworks.map(wifiName => {
                const isSelected = selectedWifi === wifiName

                return (
                    <Pressable
                        key={wifiName}
                        onPress={() => {
                            dispatch(
                                connectionActions.setSelectedWifi(wifiName),
                            )
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
    )
}

interface Props {
    sheetRef: RefObject<BottomSheetMethods | null>
    onCloseSheet: () => void
    isSheetOpen: boolean
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
export default function WifiDrawer({
    sheetRef,
    onCloseSheet,
    isSheetOpen,
}: Props) {
    const selectedWifi = useAppSelector(state => state.connection.selectedWifi)

    return (
        <>
            {isSheetOpen && (
                <Pressable
                    onPress={() => {
                        sheetRef.current?.close()
                    }}
                    className="absolute inset-0 bg-black/40"
                />
            )}
            <BottomSheet
                ref={sheetRef}
                index={-1}
                enablePanDownToClose
                onClose={onCloseSheet}
            >
                <BottomSheetView className="gap-4 p-4">
                    <Text>Connect glasses to the WiFi your phone uses.</Text>

                    <WifiListComponent />

                    {selectedWifi && (
                        <AppButton
                            title="Connect"
                            onPress={() => {
                                sheetRef.current?.close()
                            }}
                        />
                    )}
                </BottomSheetView>
            </BottomSheet>
        </>
    )
}
