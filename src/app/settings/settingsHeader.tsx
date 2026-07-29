import { faGear, faRotate } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { colors } from '@/constants/colors'
import { getLifelogHealth, getLifelogPendingFootage } from '@/services/lifelogService'
import { connectionActions } from '@/store/connectionSlice'
import { downloadActions } from '@/store/downloadSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export default function SettingsHeader() {
    const dispatch = useAppDispatch()
    const wifiConnected = useAppSelector(state => state.connection.wifiConnected)

    const [syncLoading, setSyncLoading] = useState<boolean>(false)

    /**
     * Verifies the connection to the glasses, then fetches all the
     * pending footage that can be processed.
     */
    const handleSync = async () => {
        setSyncLoading(true)

        const health = await getLifelogHealth()
        dispatch(connectionActions.setWifiConnected(health))

        if (!health) {
            setSyncLoading(false)
            console.error('Not connected to glasses.')
            return
        }

        const captureEvents = await getLifelogPendingFootage()

        if (captureEvents.length) {
            const pendingFootageCount = captureEvents.reduce(
                (total, event) => total + (event.footageItems?.length ?? 0),
                0,
            )

            dispatch(downloadActions.setPendingFootage(pendingFootageCount))
            dispatch(downloadActions.setDownloadedFootage(0))

            console.info(`Found ${pendingFootageCount} pending footage items to download.`)
        }

        setSyncLoading(false)
    }

    return (
        <View className="flex-row items-start justify-between">
            <Text className="font-atkinson-bold text-[22px] leading-[26px] text-primary">
                MEMORY{'\n'}SUPPORT
            </Text>

            <View className="flex-row items-center gap-4">
                {wifiConnected && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Sync memories"
                        className="h-11 gap-2 flex-row items-center justify-center rounded-full bg-primary-container px-4 active:bg-primary-fixed-dim"
                        onPress={() => void handleSync()}
                        disabled={syncLoading}
                    >
                        <FontAwesomeIcon icon={faRotate} size={12} color={colors.primary} />
                        <Text className="font-atkinson-semibold text-[16px] text-primary">
                            {syncLoading ? 'Syncing...' : 'Sync'}
                        </Text>
                    </Pressable>
                )}

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open settings"
                    className="h-11 w-11 items-center justify-center active:opacity-70"
                >
                    <FontAwesomeIcon icon={faGear} size={24} color={colors.primary} />
                </Pressable>
            </View>
        </View>
    )
}
