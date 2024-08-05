import { configureStore } from '@reduxjs/toolkit'

import authReducer from 'features/auth/authSlice'
import windowReducer from 'features/window/windowSlice'

export const store = configureStore({
  reducer: {
    window: windowReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
