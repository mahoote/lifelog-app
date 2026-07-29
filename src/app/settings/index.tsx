import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import DeviceStatusCard from '@/app/settings/deviceStatusCard'
import RoleSelector from '@/app/settings/roleSelector'
import SettingsHeader from '@/app/settings/settingsHeader'
import SyncProcessCard from '@/app/settings/syncProcessCard'
import { Role } from '@/types/role'

export default function SettingsScreen() {
    const [selectedRole, setSelectedRole] = useState<Role>('user')

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <ScrollView
                className="flex-1"
                contentContainerClassName="px-8 pb-10 pt-2"
                showsVerticalScrollIndicator={false}
            >
                <View className="gap-8">
                    <SettingsHeader />
                    <DeviceStatusCard />
                    <RoleSelector selectedRole={selectedRole} onSelectRole={setSelectedRole} />
                    <SyncProcessCard />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
