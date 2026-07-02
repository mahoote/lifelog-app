import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ConnectionState {
    bluetoothConnected: boolean
    wifiConnected: boolean
    savedWifi: string | null
    wifiIpAddress: string | null
}

const initialState: ConnectionState = {
    bluetoothConnected: false,
    wifiConnected: false,
    savedWifi: null,
    wifiIpAddress: null,
}

const connectionSlice = createSlice({
    name: 'connection',
    initialState,
    reducers: {
        setSavedWifi(state, action: PayloadAction<string | null>) {
            state.savedWifi = action.payload
        },
    },
})

export const connectionActions = connectionSlice.actions
export const connectionReducer = connectionSlice.reducer

void connectionActions
void connectionReducer
