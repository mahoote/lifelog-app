import { FootageItem } from '@/types/footageItem'
import { TimeOfDay } from '@/types/galleryDay'

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
