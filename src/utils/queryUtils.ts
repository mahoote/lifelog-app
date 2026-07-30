import { QueryClient } from '@tanstack/react-query'

export async function invalidateQueries(queryClient: QueryClient) {
    await queryClient.invalidateQueries({
        queryKey: ['gallery-days'],
    })

    await queryClient.invalidateQueries({
        queryKey: ['gallery-images'],
    })
}
