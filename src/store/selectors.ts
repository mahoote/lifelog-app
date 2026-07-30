import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@/store/store'

export const selectSelectedDateString = (state: RootState) => state.footage.selectedDate

export const selectSelectedDate = createSelector([selectSelectedDateString], selectedDate => {
    if (!selectedDate) {
        return null
    }

    const date = new Date(selectedDate)

    if (Number.isNaN(date.getTime())) {
        return null
    }

    return date
})
