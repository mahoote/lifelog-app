import { useQuery } from '@tanstack/react-query'

import { getFootageItemsForDay } from '@/repositories/footageItemRepository'
import { FootageType } from '@/types/footageItem'

export function useGalleryImages(dayKey: string | null, type: FootageType = FootageType.PHOTO) {
    return useQuery({
        queryKey: ['gallery-images', dayKey, type],
        queryFn: () => {
            if (!dayKey) {
                return []
            }

            return getFootageItemsForDay(dayKey, type)
        },
        enabled: Boolean(dayKey),
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    })
}
