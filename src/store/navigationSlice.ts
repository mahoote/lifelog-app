import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Role } from '@/types/role'

export interface NavigationState {
    role: Role
}

const initialState: NavigationState = {
    role: 'caretaker',
}

const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        setRole: (state, action: PayloadAction<Role>) => {
            state.role = action.payload
        },
    },
})

export const navigationActions = navigationSlice.actions
export const navigationReducer = navigationSlice.reducer

void navigationActions
void navigationReducer
