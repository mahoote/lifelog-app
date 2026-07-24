import '../../global.css'

import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { initDatabase } from '@/database'
import { store } from '@/store/store'

export default function RootLayout() {
    useEffect(() => {
        initDatabase()
    }, [])

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <Stack>
                    <Stack.Screen name="index" options={{ title: 'Lifelog' }} />
                </Stack>
            </Provider>
        </GestureHandlerRootView>
    )
}
