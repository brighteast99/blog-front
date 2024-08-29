import { configureStore } from '@reduxjs/toolkit'

import authReducer from './slices/auth/authSlice'
import blogInfoReducer from './slices/blog/blogSlice'
import windowReducer from './slices/window/windowSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    window: windowReducer,
    blog: blogInfoReducer
  },
  devTools: !process.env.REACT_APP_PRODUCTION
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
