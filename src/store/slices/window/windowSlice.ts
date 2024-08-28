import { createSlice } from '@reduxjs/toolkit'

import type { RootState } from 'store'

export type breakpoint = 'mobile' | 'tablet' | 'desktop'

export const BREAKPOINT_TABLET = 1440
export const BREAKPOINT_MOBILE = 1080

function getBreakpoint(width: number): breakpoint {
  if (width > BREAKPOINT_TABLET) return 'desktop'
  if (width > BREAKPOINT_MOBILE) return 'tablet'
  return 'mobile'
}

export interface WindowState {
  breakpoint: 'mobile' | 'tablet' | 'desktop'
}

const initialState: WindowState = {
  breakpoint: getBreakpoint(window.innerWidth)
}

export const createWindowSlice = (initialState: WindowState) =>
  createSlice({
    name: 'window',
    initialState,
    reducers: {
      updateBreakpoint: (
        state,
        action: {
          payload: { width: number }
          type: string
        }
      ) => {
        state.breakpoint = getBreakpoint(action.payload.width)
      }
    }
  })

export const windowSlice = createWindowSlice(initialState)

export const { updateBreakpoint } = windowSlice.actions

export const selectBreakpoint = (state: RootState) => state.window.breakpoint

export default windowSlice.reducer
