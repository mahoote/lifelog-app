export function getDayKey(isoDate: string): string {
    return isoDate.slice(0, 10)
}
export function formatImageTime(createdAt: string): string {
    return new Date(createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    })
}
