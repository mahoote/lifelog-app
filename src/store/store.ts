import { configureStore } from '@reduxjs/toolkit'
import { connectionReducer } from './connectionSlice'
import { downloadReducer } from './downloadSlice'
import { navigationReducer } from './navigationSlice'

export const store = configureStore({
    reducer: {
        connection: connectionReducer,
        download: downloadReducer,
        navigation: navigationReducer,
    },
})
