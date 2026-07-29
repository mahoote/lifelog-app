import { faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { Text, View } from 'react-native'
import RoleCard from '@/app/settings/roleCard'
import { Role, RoleOption } from '@/types/role'

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

interface Props {
    selectedRole: Role
    onSelectRole: (role: Role) => void
}

export default function RoleSelector({ selectedRole, onSelectRole }: Props) {
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
