import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ConnectionState {
    bluetoothConnected: boolean
    wifiConnected: boolean
    selectedWifi: string | null
    wifiIpAddress: string | null
}

const initialState: ConnectionState = {
    bluetoothConnected: false,
    wifiConnected: false,
    selectedWifi: null,
    wifiIpAddress: null,
}

const connectionSlice = createSlice({
    name: 'connection',
    initialState,
    reducers: {
        setSelectedWifi(state, action: PayloadAction<string | null>) {
            state.selectedWifi = action.payload
        },
    },
})

export const connectionActions = connectionSlice.actions
export const connectionReducer = connectionSlice.reducer

void connectionActions
void connectionReducer
