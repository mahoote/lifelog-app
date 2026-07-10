import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LifelogHealth } from '@/types/lifelog'

export interface ConnectionState {
    savedWifi: string | null
    wifiConnected: LifelogHealth | null
}

const initialState: ConnectionState = {
    savedWifi: null,
    wifiConnected: null,
}

const connectionSlice = createSlice({
    name: 'connection',
    initialState,
    reducers: {
        setSavedWifi(state, action: PayloadAction<string | null>) {
            state.savedWifi = action.payload
        },
        setWifiConnected(state, action: PayloadAction<LifelogHealth | null>) {
            state.wifiConnected = action.payload
        },
    },
})

export const connectionActions = connectionSlice.actions
export const connectionReducer = connectionSlice.reducer

void connectionActions
void connectionReducer
