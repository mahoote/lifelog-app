import { configureStore } from '@reduxjs/toolkit'
import { connectionReducer } from './connectionSlice'
import { downloadReducer } from './downloadSlice'

export const store = configureStore({
    reducer: {
        connection: connectionReducer,
        download: downloadReducer,
    },
})
