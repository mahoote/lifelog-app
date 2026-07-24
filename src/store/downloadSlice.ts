import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DownloadState {
    pendingFootage: number
    downloadedFootage: number
}

const initialState: DownloadState = {
    pendingFootage: 0,
    downloadedFootage: 0,
}

const downloadSlice = createSlice({
    name: 'download',
    initialState,
    reducers: {
        setPendingFootage(state, action: PayloadAction<number>) {
            state.pendingFootage = action.payload
        },
        addDownloadedFootage(state, action: PayloadAction<number>) {
            state.downloadedFootage += action.payload
        },
        setDownloadedFootage(state, action: PayloadAction<number>) {
            state.downloadedFootage = action.payload
        },
    },
})

export const downloadActions = downloadSlice.actions
export const downloadReducer = downloadSlice.reducer

void downloadActions
void downloadReducer
