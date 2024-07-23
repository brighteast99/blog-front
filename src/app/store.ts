import { configureStore } from '@reduxjs/toolkit'
import authReducer from 'features/auth/authSlice'
import sidebarReducer from 'features/sidebar/sidebarSlice'
import windowReducer from 'features/window/windowSlice'

export const store = configureStore({
  reducer: {
    window: windowReducer,
    sidebar: sidebarReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
