import { useRouter } from 'expo-router'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import DeviceStatusCard from '@/app/settings/deviceStatusCard'
import RoleSelector from '@/app/settings/roleSelector'
import SyncProcessCard from '@/app/settings/syncProcessCard'
import AppHeader from '@/components/appHeader'
import { useAppSelector } from '@/store/hooks'

export default function SettingsScreen() {
    const router = useRouter()
    const role = useAppSelector(state => state.navigation.role)

    /**
     * Navigate to the correct route based on the role.
     */
    const handleNavigate = () => {
        switch (role) {
            case 'caretaker':
                router.push('/caretaker')
                break
            case 'user':
                router.push('/diary')
                break
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <ScrollView
                className="flex-1"
                contentContainerClassName="px-8 pb-10 pt-2"
                showsVerticalScrollIndicator={false}
            >
                <View className="gap-8">
                    <AppHeader title="Settings" variant="settings" onBackPress={handleNavigate} />
                    <DeviceStatusCard />
                    <RoleSelector />
                    <SyncProcessCard />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
