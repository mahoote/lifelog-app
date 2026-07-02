import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/src/types'
import { Dispatch, RefObject, SetStateAction, useState } from 'react'
import { Pressable, View, Text, TextInput } from 'react-native'
import { AppButton } from '@/components/appButton'
import { connectionActions } from '@/store/connectionSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

/**
 * List of the available Wi-Fi networks the glasses can connect to.
 * @param param0
 * @param param0.setPressedWifi - The current pressed Wi-Fi by the user.
 * @constructor
 */
function WifiListComponent({
    setPressedWifi,
}: {
    setPressedWifi: Dispatch<SetStateAction<string | null>>
}) {
    const selectedWifi = useAppSelector(state => state.connection.savedWifi)

    return (
        <View className="gap-2">
            {wifiNetworks.map((wifiName, index) => {
                const isSelected = selectedWifi === wifiName

                return (
                    <Pressable
                        key={index}
                        onPress={() => {
                            setPressedWifi(wifiName)
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
 * @param param0.onCloseSheet - Used to close the sheet when the user presses outside of it.
 * @param param0.isSheetOpen - Used to determine if the sheet is open or closed.
 * @constructor
 */
export default function WifiDrawer({ sheetRef, onCloseSheet, isSheetOpen }: Props) {
    const dispatch = useAppDispatch()
    const [pressedWifi, setPressedWifi] = useState<string | null>(null)

    const handleClose = () => {
        setPressedWifi(null)
        sheetRef.current?.close()
    }

    const handleConnect = () => {
        dispatch(connectionActions.setSavedWifi(pressedWifi))
        handleClose()
    }

    return (
        <>
            {isSheetOpen && <Pressable onPress={handleClose} className="absolute inset-0 bg-black/40" />}
            <BottomSheet ref={sheetRef} index={-1} enablePanDownToClose onClose={onCloseSheet}>
                <BottomSheetView className="gap-4 px-4 pb-8">
                    {!pressedWifi ? (
                        <>
                            <Text className="pt-4">Connect glasses to the WiFi your phone uses.</Text>
                            <WifiListComponent setPressedWifi={setPressedWifi} />
                        </>
                    ) : (
                        <>
                            <Pressable onPress={() => setPressedWifi(null)}>
                                <Text>Back</Text>
                            </Pressable>
                            <Text className="text-lg text-center w-full">{pressedWifi}</Text>

                            <View>
                                <Text>Password:</Text>
                                <TextInput className="bg-neutral-200 rounded-xl" />
                            </View>
                            <AppButton title="Connect" onPress={() => handleConnect()} />
                        </>
                    )}
                </BottomSheetView>
            </BottomSheet>
        </>
    )
}
