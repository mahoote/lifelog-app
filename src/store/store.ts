import { configureStore } from '@reduxjs/toolkit'
import { connectionReducer } from './connectionSlice'
import { footageReducer } from './footageSlice'
import { navigationReducer } from './navigationSlice'

export const store = configureStore({
    reducer: {
        connection: connectionReducer,
        footage: footageReducer,
        navigation: navigationReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
