import { DateOption, TimeOfDay } from '@/types/date'
import { FootageItem } from '@/types/footageItem'

import { GalleryDay } from '@/types/galleryDay'

export function getDayKey(isoDate: string): string {
    return isoDate.slice(0, 10)
}
export function formatImageTime(createdAt: string): string {
    return new Date(createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    })
}
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function getTimeOfDay(createdAt: string): TimeOfDay {
    const hour = new Date(createdAt).getHours()
    if (hour >= 6 && hour < 12) return 'Morning'
    if (hour >= 12 && hour < 18) return 'Afternoon'
    if (hour >= 18 && hour < 21) return 'Evening'
    return 'Night'
}

export function groupByTimeOfDay(images: FootageItem[]): { label: TimeOfDay; items: FootageItem[] }[] {
    const order: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening', 'Night']
    const map = new Map<TimeOfDay, FootageItem[]>()

    const sorted = [...images].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )

    for (const image of sorted) {
        const label = getTimeOfDay(image.createdAt)
        if (!map.has(label)) map.set(label, [])
        map.get(label)!.push(image)
    }

    return order.filter(label => map.has(label)).map(label => ({ label, items: map.get(label)! }))
}
export function formatDateOption(day: GalleryDay): DateOption {
    const date = new Date(`${day.dayKey}T00:00:00`)
    const todayKey = new Date().toISOString().slice(0, 10)

    return {
        id: day.dayKey,
        label:
            day.dayKey === todayKey ? 'Today' : date.toLocaleDateString('en-GB', { weekday: 'short' }),
        day: date.getDate(),
        month: date.toLocaleDateString('en-GB', { month: 'short' }),
    }
}

export function formatDiaryDatetime(createdAt: string): string {
    const date = new Date(createdAt)
    const datePart = date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
    const timePart = date.toLocaleTimeString('en-GB', {
        hour: 'numeric',
        minute: '2-digit',
    })

    return `${datePart} • ${timePart}`
}
