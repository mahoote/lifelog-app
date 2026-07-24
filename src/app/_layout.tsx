import '../../global.css'

import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { store } from '@/store/store'

export default function RootLayout() {
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
