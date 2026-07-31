import { useQuery } from '@tanstack/react-query'

import { getGalleryDays } from '@/repositories/galleryDayRepository'

export function useGalleryDays() {
    return useQuery({
        queryKey: ['gallery-days'],
        queryFn: getGalleryDays,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    })
}
