import { createSlice } from '@reduxjs/toolkit'

import type { RootState } from 'app/store'

export type breakpoint = 'mobile' | 'tablet' | 'desktop'

export const BREAKPOINT_TABLET = 1440
export const BREAKPOINT_MOBILE = 1080

function getBreakpoint(width: number): breakpoint {
  if (width > BREAKPOINT_TABLET) return 'desktop'
  if (width > BREAKPOINT_MOBILE) return 'tablet'
  return 'mobile'
}

export interface WindowState {
  size: {
    width?: number
    height?: number
  }
  breakpoint: 'mobile' | 'tablet' | 'desktop'
}

const initialState: WindowState = {
  size: {
    width: window.innerWidth,
    height: window.innerHeight
  },
  breakpoint: getBreakpoint(window.innerWidth)
}

export const createWindowSlice = (initialState: WindowState) =>
  createSlice({
    name: 'window',
    initialState,
    reducers: {
      updateSize: (
        state,
        action: {
          payload: { size: { width: number; height: number } }
          type: string
        }
      ) => {
        let { size } = action.payload

        state.size = size
        state.breakpoint = getBreakpoint(size.width)
      }
    }
  })

export const windowSlice = createWindowSlice(initialState)

export const { updateSize } = windowSlice.actions

export const selectBreakpoint = (state: RootState) => state.window.breakpoint

export default windowSlice.reducer
