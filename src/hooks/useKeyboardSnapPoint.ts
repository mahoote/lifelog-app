import { BottomSheetMethods } from '@gorhom/bottom-sheet/src/types'
import { RefObject, useEffect, useMemo, useState } from 'react'
import { Keyboard } from 'react-native'

/**
 * If the bottom sheet is used and the keyboard is visible, introduce a snap point
 * so the content is above the keyboard.
 * @param sheetRef
 * @param isSheetOpen
 * @param keyboardSnapPoint
 */
export function useKeyboardSnapPoint(
    sheetRef: RefObject<BottomSheetMethods | null>,
    isSheetOpen: boolean,
    keyboardSnapPoint = '80%',
) {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

    const snapPoints: string[] = useMemo(
        () => (isKeyboardVisible ? [keyboardSnapPoint] : []),
        [isKeyboardVisible, keyboardSnapPoint],
    )

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardVisible(true)
        })

        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardVisible(false)
        })

        return () => {
            showSubscription.remove()
            hideSubscription.remove()
        }
    }, [])

    useEffect(() => {
        if (isSheetOpen) {
            sheetRef.current?.snapToIndex(0)
        }
    }, [isKeyboardVisible, isSheetOpen, sheetRef])

    return {
        snapPoints,
        isKeyboardVisible,
    }
}
