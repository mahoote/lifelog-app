import {
    faArrowDownWideShort,
    faCalendar,
    faCheckCircle,
    faChevronDown,
    faExclamationCircle,
    faRotate,
    faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useState } from 'react'
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import AppHeader from '@/components/appHeader'
import { colors } from '@/constants/colors'

type MediaTab = 'images' | 'videos'
type TimeFilter = 'all' | 'morning' | 'afternoon' | 'evening'
type ImageBadge = 'verified' | 'flagged' | 'processing' | 'none'

interface MediaItem {
    id: string
    time: string
    badge: ImageBadge
    uri?: string
    overflow?: number
}

const todayItems: MediaItem[] = [
    { id: '1', time: '09:15 AM', badge: 'verified', uri: 'https://picsum.photos/seed/a1/200/200' },
    { id: '2', time: '10:30 AM', badge: 'flagged', uri: 'https://picsum.photos/seed/a2/200/200' },
    { id: '3', time: '11:00 AM', badge: 'none', uri: 'https://picsum.photos/seed/a3/200/200' },
    { id: '4', time: '', badge: 'processing' },
]

const yesterdayItems: MediaItem[] = [
    { id: '5', time: '', badge: 'none', uri: 'https://picsum.photos/seed/b1/200/200' },
    { id: '6', time: '', badge: 'none', uri: 'https://picsum.photos/seed/b2/200/200' },
    { id: '7', time: '', badge: 'none', uri: 'https://picsum.photos/seed/b3/200/200' },
    { id: '8', time: '', badge: 'none', uri: 'https://picsum.photos/seed/b4/200/200' },
    { id: '9', time: '', badge: 'none', uri: 'https://picsum.photos/seed/b5/200/200' },
    { id: '10', time: '', badge: 'none', overflow: 3 },
]

const timeFilters: { id: TimeFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'morning', label: 'Morning' },
    { id: 'afternoon', label: 'Afternoon' },
    { id: 'evening', label: 'Evening' },
]

export default function CaretakerScreen() {
    const [activeTab, setActiveTab] = useState<MediaTab>('images')
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

    return (
        <SafeAreaView className="flex-1 bg-surface">
            <ScrollView
                className="flex-1"
                contentContainerClassName="pb-10"
                showsVerticalScrollIndicator={false}
            >
                <View className="px-8 pt-2">
                    <AppHeader />
                </View>

                <View className="mt-6 px-8">
                    <MediaTabBar activeTab={activeTab} onTabChange={setActiveTab} />
                </View>

                <View className="mt-4 px-8">
                    <SyncStatusBar />
                </View>

                <View className="mt-4 px-8">
                    <DateFilterRow />
                </View>

                <View className="mt-4 px-8">
                    <TimeOfDayFilter activeFilter={timeFilter} onFilterChange={setTimeFilter} />
                </View>

                <View className="mt-7 px-8">
                    <ImageSection title="Today" items={todayItems} />
                </View>

                <View className="mt-8 px-8">
                    <ImageSection title="Yesterday" items={yesterdayItems} />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

// ---------------------------------------------------------------------------
// Media tab bar
// ---------------------------------------------------------------------------

interface MediaTabBarProps {
    activeTab: MediaTab
    onTabChange: (tab: MediaTab) => void
}

function MediaTabBar({ activeTab, onTabChange }: MediaTabBarProps) {
    return (
        <View className="flex-row rounded-full bg-surface-container-high p-1">
            <TabPill
                label="Images"
                icon="🖼"
                active={activeTab === 'images'}
                onPress={() => onTabChange('images')}
            />
            <TabPill
                label="Videos"
                icon="📹"
                active={activeTab === 'videos'}
                onPress={() => onTabChange('videos')}
            />
        </View>
    )
}

interface TabPillProps {
    label: string
    icon: string
    active: boolean
    onPress: () => void
}

function TabPill({ label, icon, active, onPress }: TabPillProps) {
    return (
        <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={onPress}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-full py-3 ${
                active ? 'bg-surface shadow-soft' : 'bg-transparent'
            }`}
        >
            <Text className="text-[16px] leading-[18px]">{icon}</Text>
            <Text
                className={`font-atkinson-semibold text-[16px] ${
                    active ? 'text-on-surface' : 'text-on-surface-variant'
                }`}
            >
                {label}
            </Text>
        </Pressable>
    )
}

// ---------------------------------------------------------------------------
// Sync status bar
// ---------------------------------------------------------------------------

function SyncStatusBar() {
    return (
        <View className="flex-row items-center justify-between rounded-full bg-primary-fixed px-5 py-4">
            <View className="flex-row items-center gap-3">
                <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                <View>
                    <Text className="font-atkinson-bold text-[16px] leading-[20px] text-on-primary-fixed">
                        24 New Items
                    </Text>
                    <Text className="font-atkinson text-[14px] leading-[18px] text-on-primary-fixed-variant">
                        Syncing...
                    </Text>
                </View>
            </View>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Process new items"
                className="h-11 flex-row items-center justify-center gap-2 rounded-full bg-primary px-5 active:bg-on-primary-container"
            >
                <FontAwesomeIcon icon={faWandMagicSparkles} size={14} color={colors.onPrimary} />
                <Text className="font-atkinson-bold text-[16px] text-on-primary">Process</Text>
            </Pressable>
        </View>
    )
}

// ---------------------------------------------------------------------------
// Date filter row
// ---------------------------------------------------------------------------

function DateFilterRow() {
    return (
        <View className="flex-row items-center justify-between">
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select date"
                className="flex-row items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 py-3 active:bg-surface-container"
            >
                <FontAwesomeIcon icon={faCalendar} size={15} color={colors.onSurfaceVariant} />
                <Text className="font-atkinson-medium text-[16px] text-on-surface">Oct 24, 2023</Text>
                <FontAwesomeIcon icon={faChevronDown} size={12} color={colors.onSurfaceVariant} />
            </Pressable>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sort images"
                className="flex-row items-center gap-2 active:opacity-70"
            >
                <Text className="font-atkinson-medium text-[16px] text-on-surface-variant">
                    324 Images
                </Text>
                <FontAwesomeIcon icon={faArrowDownWideShort} size={16} color={colors.onSurfaceVariant} />
            </Pressable>
        </View>
    )
}

// ---------------------------------------------------------------------------
// Time of day filter
// ---------------------------------------------------------------------------

interface TimeOfDayFilterProps {
    activeFilter: TimeFilter
    onFilterChange: (filter: TimeFilter) => void
}

function TimeOfDayFilter({ activeFilter, onFilterChange }: TimeOfDayFilterProps) {
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

// ---------------------------------------------------------------------------
// Image section
// ---------------------------------------------------------------------------

interface ImageSectionProps {
    title: string
    items: MediaItem[]
}

function ImageSection({ title, items }: ImageSectionProps) {
    const rows: MediaItem[][] = []
    for (let i = 0; i < items.length; i += 3) {
        rows.push(items.slice(i, i + 3))
    }

    return (
        <View>
            <Text className="mb-4 font-atkinson-bold text-[22px] leading-[28px] text-on-surface">
                {title}
            </Text>

            <View className="gap-2">
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row gap-2">
                        {row.map(item => (
                            <ImageTile key={item.id} item={item} />
                        ))}
                    </View>
                ))}
            </View>
        </View>
    )
}

// ---------------------------------------------------------------------------
// Image tile
// ---------------------------------------------------------------------------

interface ImageTileProps {
    item: MediaItem
}

function ImageTile({ item }: ImageTileProps) {
    if (item.overflow !== undefined) {
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Show ${item.overflow} more items`}
                className="aspect-square flex-1 items-center justify-center rounded-lg bg-surface-container-high active:opacity-80"
            >
                <Text className="font-atkinson-bold text-[20px] text-on-surface-variant">
                    +{item.overflow}
                </Text>
            </Pressable>
        )
    }

    if (item.badge === 'processing') {
        return (
            <View className="aspect-square flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant bg-surface-container">
                <FontAwesomeIcon icon={faRotate} size={28} color={colors.primary} />
                <Text className="font-atkinson-medium text-[14px] text-on-surface-variant">
                    Processing...
                </Text>
            </View>
        )
    }

    return (
        <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel={item.time ? `Memory at ${item.time}` : 'Memory image'}
            className="aspect-square flex-1 overflow-hidden rounded-lg active:opacity-90"
        >
            {item.uri ? (
                <Image source={{ uri: item.uri }} className="h-full w-full" resizeMode="cover" />
            ) : (
                <View className="h-full w-full bg-surface-container-high" />
            )}

            <View className="absolute inset-0 justify-between p-2">
                <View className="items-end">
                    {item.badge === 'verified' && (
                        <FontAwesomeIcon icon={faCheckCircle} size={18} color={colors.onPrimary} />
                    )}
                    {item.badge === 'flagged' && (
                        <FontAwesomeIcon icon={faExclamationCircle} size={18} color={colors.onPrimary} />
                    )}
                </View>

                {item.time ? (
                    <View className="self-start rounded-md bg-black/50 px-2 py-1">
                        <Text className="font-atkinson-semibold text-[13px] text-white">
                            {item.time}
                        </Text>
                    </View>
                ) : null}
            </View>
        </Pressable>
    )
}
