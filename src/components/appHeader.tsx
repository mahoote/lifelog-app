import { faArrowLeft, faGear, faRotate } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { colors } from '@/constants/colors'
import { getLifelogHealth, getLifelogPendingFootage } from '@/services/lifelogService'
import { connectionActions } from '@/store/connectionSlice'
import { footageActions } from '@/store/footageSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

interface Props {
    title: string
    variant?: 'default' | 'settings' | 'caretaker'
    onBackPress?: () => void
}

export default function AppHeader({ title, variant = 'default', onBackPress }: Props) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const wifiConnected = useAppSelector(state => state.connection.wifiConnected)

    const [syncLoading, setSyncLoading] = useState(false)

    const handleSync = async () => {
        setSyncLoading(true)

        const health = await getLifelogHealth()
        dispatch(connectionActions.setWifiConnected(health))

        if (!health) {
            setSyncLoading(false)
            console.error('Not connected to glasses.')
            router.replace('/settings')
            return
        }

        const captureEvents = await getLifelogPendingFootage()

        if (captureEvents.length) {
            const pendingFootageCount = captureEvents.reduce(
                (total, event) => total + (event.footageItems?.length ?? 0),
                0,
            )

            dispatch(footageActions.setPendingFootage(pendingFootageCount))
            dispatch(footageActions.setDownloadedFootage(0))
        }

        setSyncLoading(false)
    }

    const handleButtonPress = () => {
        switch (variant) {
            case 'settings':
                onBackPress?.()
                break
            default:
                router.push('/settings')
                break
        }
    }

    return (
        <View className="flex-row items-center justify-between">
            <Text className="font-atkinson-bold text-[22px] leading-[26px] text-primary">{title}</Text>

            <View className="flex-row items-center gap-4">
                {wifiConnected && variant === 'caretaker' && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Sync memories"
                        disabled={syncLoading}
                        onPress={() => void handleSync()}
                        className="h-11 flex-row items-center justify-center gap-2 rounded-full bg-primary-container px-4 active:bg-primary-fixed-dim"
                    >
                        <FontAwesomeIcon icon={faRotate} size={12} color={colors.primary} />
                        <Text className="font-atkinson-semibold text-[16px] text-primary">
                            {syncLoading ? 'Syncing...' : 'Sync'}
                        </Text>
                    </Pressable>
                )}

                {variant === 'settings' ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={onBackPress}
                        className="h-11 flex-row items-center justify-center gap-2 active:opacity-70"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} size={18} color={colors.primary} />
                        <Text className="font-atkinson-semibold text-[16px] text-primary">Back</Text>
                    </Pressable>
                ) : (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Open settings"
                        onPress={handleButtonPress}
                        className="h-11 w-11 items-center justify-center active:opacity-70"
                    >
                        <FontAwesomeIcon icon={faGear} size={24} color={colors.primary} />
                    </Pressable>
                )}
            </View>
        </View>
    )
}
