import { useQuery } from '@tanstack/react-query'
import { getFootageItemsForDay } from '@/repositories/lifelogRepository'

export function useGalleryImages(dayKey: string | null) {
    return useQuery({
        queryKey: ['gallery-images', dayKey],
        queryFn: () => {
            if (!dayKey) {
                return []
            }

            return getFootageItemsForDay(dayKey)
        },
        enabled: Boolean(dayKey),
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    })
}
