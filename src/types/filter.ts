export type TimeFilter = 'all' | 'morning' | 'afternoon' | 'evening'

export const timeFilters: { id: TimeFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'morning', label: 'Morning' },
    { id: 'afternoon', label: 'Afternoon' },
    { id: 'evening', label: 'Evening' },
]
