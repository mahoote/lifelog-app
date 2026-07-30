import { faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { Text, View } from 'react-native'
import RoleCard from '@/app/settings/roleCard'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { navigationActions } from '@/store/navigationSlice'
import { RoleOption } from '@/types/role'

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

export default function RoleSelector() {
    const dispatch = useAppDispatch()
    const roleState = useAppSelector(state => state.navigation.role)

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
                        selected={roleState === role.id}
                        onPress={() => dispatch(navigationActions.setRole(role.id))}
                    />
                ))}
            </View>
        </View>
    )
}
