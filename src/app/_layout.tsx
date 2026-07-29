import '../../global.css'

import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import AtkinsonBold from '../../assets/fonts/AtkinsonHyperlegibleNext-Bold.ttf'
import AtkinsonMedium from '../../assets/fonts/AtkinsonHyperlegibleNext-Medium.ttf'
import AtkinsonRegular from '../../assets/fonts/AtkinsonHyperlegibleNext-Regular.ttf'
import AtkinsonSemiBold from '../../assets/fonts/AtkinsonHyperlegibleNext-SemiBold.ttf'

import { initDatabase } from '@/database'
import { store } from '@/store/store'

void SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'Atkinson Hyperlegible Next': AtkinsonRegular,
        'Atkinson Hyperlegible Next Medium': AtkinsonMedium,
        'Atkinson Hyperlegible Next SemiBold': AtkinsonSemiBold,
        'Atkinson Hyperlegible Next Bold': AtkinsonBold,
    })

    useEffect(() => {
        initDatabase()
    }, [])

    useEffect(() => {
        if (fontsLoaded) {
            void SplashScreen.hideAsync()
        }
    }, [fontsLoaded])

    if (!fontsLoaded) {
        return null
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="index" options={{ title: 'Lifelog' }} />
                    <Stack.Screen
                        name="settings/index"
                        options={{ title: 'Settings', animation: 'ios_from_right' }}
                    />
                    <Stack.Screen
                        name="caretaker/index"
                        options={{ title: 'Caretaker', animation: 'ios_from_left' }}
                    />
                    <Stack.Screen name="diary/index" options={{ title: 'Diary' }} />
                </Stack>
            </Provider>
        </GestureHandlerRootView>
    )
}
