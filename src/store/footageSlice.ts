import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FootageState {
    pendingFootage: number
    downloadedFootage: number
    selectedDate: Date | null
}

const initialState: FootageState = {
    pendingFootage: 0,
    downloadedFootage: 0,
    selectedDate: null,
}

const footageSlice = createSlice({
    name: 'footage',
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
        setSelectedDate(state, action: PayloadAction<Date | null>) {
            state.selectedDate = action.payload
        },
    },
})

export const footageActions = footageSlice.actions
export const footageReducer = footageSlice.reducer

void footageActions
void footageReducer
