import { createSlice } from '@reduxjs/toolkit'
import { RootState } from 'app/store'

export interface SidebarState {
  isFolded: boolean
}

const initialState: SidebarState = {
  isFolded: false
}

export const createSidebarSlice = (initialState: SidebarState) =>
  createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
      fold: (state) => {
        state.isFolded = true
      },
      expand: (state) => {
        state.isFolded = false
      },
      toggle: (state) => {
        state.isFolded = !state.isFolded
      }
    }
  })

export const sidebarSlice = createSidebarSlice(initialState)

export const { fold, expand, toggle } = sidebarSlice.actions

export const selectSidebarIsFolded = (state: RootState) =>
  state.sidebar.isFolded

export default sidebarSlice.reducer
