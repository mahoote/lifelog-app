import {
    faGear,
    faRotate,
    faWifi,
    faExclamation,
    IconDefinition,
    faUserGroup,
    faUser,
    faTrash,
    faArrowsRotate,
    faGlasses,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@/constants/colors'

type Role = 'user' | 'caretaker'

interface RoleOption {
    id: Role
    title: string
    description: string
    icon: IconDefinition
}

const roleOptions: RoleOption[] = [
    {
        id: 'user',
        title: 'User',
        description: 'A simple photo diary of your day.',
        icon: faUser,
    },
    {
        id: 'caretaker',
        title: 'Caretaker',
        description: 'Access all recorded media and tools.',
        icon: faUserGroup,
    },
]

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

function SettingsHeader() {
    return (
        <View className="flex-row items-start justify-between">
            <Text className="font-atkinson-bold text-[22px] leading-[26px] text-primary">
                MEMORY{'\n'}SUPPORT
            </Text>

            <View className="flex-row items-center gap-4">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Sync memories"
                    className="h-11 gap-2 flex-row items-center justify-center rounded-full bg-primary-container px-4 active:bg-primary-fixed-dim"
                >
                    <FontAwesomeIcon icon={faRotate} size={12} color={colors.primary} />
                    <Text className="font-atkinson-semibold text-[16px] text-primary">Sync</Text>
                </Pressable>

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

function DeviceStatusCard() {
    return (
        <View className="rounded-lg bg-surface-container-high px-6 pb-6 pt-7">
            <View className="mb-8 flex-row items-center">
                {/*<Text className="font-atkinson-bold text-[15px] uppercase tracking-[1.2px] text-secondary">*/}
                {/*    Device Status*/}
                {/*</Text>*/}

                <View className="flex-row items-center rounded-full bg-error-container gap-1 px-3 py-2">
                    <FontAwesomeIcon icon={faExclamation} size={12} color={colors.onErrorContainer} />
                    <Text className="font-atkinson-semibold text-[15px] text-on-error-container">
                        Not Connected
                    </Text>
                </View>
            </View>

            <View className="items-center">
                <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-surface-dim">
                    <FontAwesomeIcon icon={faGlasses} size={30} color={colors.primary} />
                </View>

                <Text className="mb-2 text-center font-atkinson-bold text-[24px] leading-[30px] text-on-surface">
                    Lifelog Glasses
                </Text>

                <Text className="mb-5 max-w-[260px] text-center font-atkinson text-[18px] leading-[27px] text-on-surface-variant">
                    Connect to your glasses to sync today&apos;s memories.
                </Text>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Connect to Glasses WiFi"
                    className="h-14 w-full flex-row gap-3 items-center justify-center rounded-full bg-primary px-5 active:bg-on-primary-container"
                >
                    <FontAwesomeIcon icon={faWifi} size={20} color={colors.onPrimary} />
                    <Text className="font-atkinson-bold text-[17px] text-on-primary">
                        Connect to Glasses WiFi
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

interface RoleSelectorProps {
    selectedRole: Role
    onSelectRole: (role: Role) => void
}

function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
    return (
        <View>
            <Text className="mb-3 font-atkinson-bold text-[18px] leading-[24px] text-secondary">
                Current Role
            </Text>

            <View className="flex-row gap-3">
                {roleOptions.map(role => (
                    <RoleCard
                        key={role.id}
                        role={role}
                        selected={selectedRole === role.id}
                        onPress={() => onSelectRole(role.id)}
                    />
                ))}
            </View>
        </View>
    )
}

interface RoleCardProps {
    role: RoleOption
    selected: boolean
    onPress: () => void
}

function RoleCard({ role, selected, onPress }: RoleCardProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={onPress}
            className={`min-h-[226px] flex-1 rounded-lg px-5 py-5 active:opacity-80 ${
                selected
                    ? 'border-2 border-primary bg-primary-container'
                    : 'border-2 border-transparent bg-surface-container-high'
            }`}
        >
            <View
                className={`mb-5 h-10 w-10 items-center justify-center rounded-full ${
                    selected ? 'bg-primary-container' : 'bg-surface-dim'
                }`}
            >
                <FontAwesomeIcon icon={role.icon} size={20} color={colors.onSurfaceVariant} />
            </View>

            <Text
                className={`mb-2 font-atkinson-bold text-[17px] leading-[24px] ${
                    selected ? 'text-primary' : 'text-on-surface-variant'
                }`}
            >
                {role.title}
            </Text>

            <Text
                className={`font-atkinson text-[18px] leading-[24px] ${
                    selected ? 'text-primary' : 'text-on-surface-variant'
                }`}
            >
                {role.description}
            </Text>
        </Pressable>
    )
}

function SyncProcessCard() {
    return (
        <View className="mt-6 rounded-lg bg-surface-container-low px-6 py-7">
            <View className="mb-5 flex-row items-center">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-md bg-secondary-container">
                    <FontAwesomeIcon icon={faArrowsRotate} size={20} color={colors.primary} />
                </View>

                <View className="flex-1">
                    <Text className="font-atkinson-bold text-[18px] leading-[24px] text-on-surface">
                        Sync &amp; Process
                    </Text>
                    <Text className="mt-1 font-atkinson text-[17px] leading-[24px] text-on-surface-variant">
                        Download and organize footage
                    </Text>
                </View>
            </View>

            <View className="mb-5 h-2 rounded-full bg-surface-container-highest" />

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete all data"
                className="h-14 flex-row items-center justify-center rounded-full border-2 border-error bg-surface gap-3 active:bg-error-container"
            >
                <FontAwesomeIcon icon={faTrash} size={16} color={colors.error} />
                <Text className="font-atkinson-bold text-[17px] text-error">Delete All Data</Text>
            </Pressable>
        </View>
    )
}
