import { useState, useEffect } from 'react'
import { Text, View } from 'react-native'
import { AppButton } from '@/components/appButton'
import { getLifelogPendingFootage, getLifelogHealth } from '@/services/lifelogService'
import { connectionActions } from '@/store/connectionSlice'
import { downloadActions } from '@/store/downloadSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { downloadCaptureEventsFootage } from '@/utils/downloadUtils'
import { deleteAllSavedFootage } from '@/utils/storageUtils'

/**
 * Connection settings for the app and glasses.
 * Can set up the bluetooth connection and the Wi-Fi connection.
 * @constructor
 */
export default function ImageProcessComponent() {
    const dispatch = useAppDispatch()
    const wifiConnected = useAppSelector(state => state.connection.wifiConnected)
    const pendingFootage = useAppSelector(state => state.download.pendingFootage)
    const downloadedFootage = useAppSelector(state => state.download.downloadedFootage)

    const [displayStatus, setDisplayStatus] = useState('Not connected')
    const [refreshLoading, setRefreshLoading] = useState(false)
    const [processLoading, setProcessLoading] = useState(false)

    /**
     * Fetches the current health of the lifelog api.
     * Sets the values to the store.
     */
    const handleRefresh = async () => {
        setRefreshLoading(true)

        const health = await getLifelogHealth()
        dispatch(connectionActions.setWifiConnected(health))
        setRefreshLoading(false)
    }

    /**
     * Downloads all pending footage from the lifelog api.
     * Calculates the total pending footage items and updates the downloadedFootage state
     * for every downloaded captureEvent.
     */
    const handleDownloadFootage = async () => {
        setProcessLoading(true)

        const captureEvents = await getLifelogPendingFootage()

        if (captureEvents.length) {
            const pendingFootageCount = captureEvents.reduce(
                (total, event) => total + (event.footageItems?.length ?? 0),
                0,
            )

            dispatch(downloadActions.setPendingFootage(pendingFootageCount))
            dispatch(downloadActions.setDownloadedFootage(0))

            const downloaded = await downloadCaptureEventsFootage(
                captureEvents,
                dispatch,
                downloadActions.addDownloadedFootage,
            )
            console.info(`Downloaded ${downloaded.length} capture events and their footage.`)
        }

        setProcessLoading(false)
    }

    useEffect(() => {
        if (refreshLoading) setDisplayStatus('Updating...')
        else if (wifiConnected) setDisplayStatus('Connected through WiFi')
        else setDisplayStatus('Not connected')
    }, [refreshLoading, wifiConnected])

    return (
        <>
            <View className="gap-6 p-2 pb-8 flex-1">
                <View className="gap-4 flex-1">
                    <View className="gap-2">
                        <Text className="text-xl">Glasses</Text>
                        <Text>Status: {displayStatus}</Text>
                        {wifiConnected && (
                            <>
                                <Text>SSID: {wifiConnected.ssid}</Text>
                                <Text>IP: {wifiConnected.ip}</Text>
                            </>
                        )}
                        <AppButton
                            title="Refresh status"
                            onPress={() => void handleRefresh()}
                            loading={refreshLoading}
                        />
                    </View>
                    {wifiConnected && (
                        <View className="gap-2 justify-between flex-1">
                            <View className="gap-2">
                                <Text className="text-xl">Actions</Text>
                                <AppButton
                                    title="Process footage"
                                    onPress={() => void handleDownloadFootage()}
                                    loading={processLoading}
                                />
                                {pendingFootage > 0 && (
                                    <Text>
                                        Downloaded {downloadedFootage} of {pendingFootage} footage
                                    </Text>
                                )}
                            </View>
                            <AppButton
                                title="Delete all footage"
                                onPress={() => void deleteAllSavedFootage()}
                                loading={processLoading}
                                hasLoadingText={false}
                                color="red"
                            />
                        </View>
                    )}
                </View>
            </View>
        </>
    )
}
