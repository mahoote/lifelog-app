import { Redirect } from 'expo-router'
import { useAppSelector } from '@/store/hooks'

export default function Index() {
    const wifiConnected = useAppSelector(state => state.connection.wifiConnected)

    return <Redirect href={wifiConnected ? '/caretaker' : '/settings'} />
}
