import { configureStore } from '@reduxjs/toolkit'
import windowReducer from 'features/window/windowSlice'
import sidebarReducer from 'features/sidebar/sidebarSlice'
import authReducer from 'features/auth/authSlice'

export const store = configureStore({
  reducer: {
    window: windowReducer,
    sidebar: sidebarReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
