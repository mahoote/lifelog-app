import { Pressable, ScrollView, Text } from 'react-native'
import { TimeFilter, timeFilters } from '@/types/filter'

interface TimeOfDayFilterProps {
    activeFilter: TimeFilter
    onFilterChange: (filter: TimeFilter) => void
}

export default function TimeOfDayFilter({ activeFilter, onFilterChange }: TimeOfDayFilterProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row gap-3 py-1"
        >
            {timeFilters.map(filter => (
                <Pressable
                    key={filter.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activeFilter === filter.id }}
                    onPress={() => onFilterChange(filter.id)}
                    className={`rounded-full px-5 py-3 ${
                        activeFilter === filter.id ? 'bg-primary' : 'bg-surface-container-high'
                    }`}
                >
                    <Text
                        className={`font-atkinson-semibold text-[16px] ${
                            activeFilter === filter.id ? 'text-on-primary' : 'text-on-surface-variant'
                        }`}
                    >
                        {filter.label}
                    </Text>
                </Pressable>
            ))}
        </ScrollView>
    )
}
