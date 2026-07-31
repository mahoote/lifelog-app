import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LifelogHealth } from '@/types/lifelog'

export interface ConnectionState {
    ipAddress: string
    savedWifi: string | null
    wifiConnected: LifelogHealth | null
}

const initialState: ConnectionState = {
    ipAddress: process.env.EXPO_PUBLIC_LIFELOG_API_IP ?? '',
    savedWifi: null,
    wifiConnected: null,
}

const connectionSlice = createSlice({
    name: 'connection',
    initialState,
    reducers: {
        setIpAddress: (state, action: PayloadAction<string>) => {
            state.ipAddress = action.payload
        },
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
