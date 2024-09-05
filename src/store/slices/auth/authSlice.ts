import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { refresh, revoke } from 'utils/Auth'
import { isPast } from 'utils/dayJS'

import type { RootState } from 'store'
import type { AuthInfo } from 'types/auth'

export const STORAGE_KEY = 'auth'

type AuthStatus = 'UNAUTHORIZED' | 'AUTHORIZED' | 'REFRESHING' | 'EXPIRED'

interface AuthState {
  info?: AuthInfo
  keepLogin: boolean
  status: AuthStatus
}

const initialState: AuthState = {
  info: undefined,
  keepLogin: false,
  status: 'UNAUTHORIZED'
}

export const refreshToken = createAsyncThunk<
  AuthInfo,
  undefined,
  {
    state: RootState
  }
>(
  'auth/refreshToken',
  async (_payload, thunkAPI) => {
    // info가 undefined인 경우 condition에서 return false
    let info = thunkAPI.getState().auth.info as AuthInfo

    try {
      return await refresh(info.refreshToken)
    } catch (err) {
      return thunkAPI.rejectWithValue(null)
    }
  },
  {
    condition: (_payload, { getState }: { getState: () => RootState }) => {
      if (!getState().auth.info) return false
    }
  }
)

export const revokeToken = createAsyncThunk<
  boolean,
  any,
  {
    state: RootState
  }
>(
  'auth/revokeToken',
  async (_payload, thunkAPI) => {
    // token이 undefined인 경우 condition에서 return false
    let info = thunkAPI.getState().auth.info as AuthInfo

    try {
      return await revoke(info.refreshToken)
    } catch (err) {
      return thunkAPI.rejectWithValue(err)
    }
  },
  {
    condition: (_payload, { getState }: { getState: () => RootState }) => {
      if (!getState().auth.info) return false
    }
  }
)

export const createAuthSlice = (initialState: AuthState) =>
  createSlice({
    name: 'auth',
    initialState,
    reducers: {
      setToken: (
        state,
        action: PayloadAction<{ authInfo: AuthInfo; keepLogin: boolean }>
      ) => {
        const { authInfo, keepLogin } = action.payload
        state.info = authInfo
        state.keepLogin = keepLogin

        if (action.payload) {
          if (isPast(authInfo.payload.exp * 1000)) state.status = 'EXPIRED'
          else state.status = 'AUTHORIZED'
        } else state.status = 'UNAUTHORIZED'

        const serialized = JSON.stringify(action.payload.authInfo)

        if (keepLogin) {
          if (localStorage.getItem(STORAGE_KEY) !== serialized)
            localStorage.setItem(STORAGE_KEY, serialized)
        } else if (sessionStorage.getItem(STORAGE_KEY) !== serialized)
          sessionStorage.setItem(STORAGE_KEY, serialized)
      },
      resetToken: (_state, _action: PayloadAction<undefined>) => initialState,
      updateRefreshToken: (
        state,
        action: PayloadAction<{ refreshToken: string; expiresIn: number }>
      ) => {
        if (!state.info) return

        state.info.refreshToken = action.payload.refreshToken
        state.info.refreshExpiresIn = action.payload.expiresIn
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(refreshToken.pending, (state) => {
          state.status = 'REFRESHING'
        })
        .addCase(refreshToken.rejected, (state) => {
          state.info = undefined
          state.keepLogin = false
          state.status = 'UNAUTHORIZED'

          localStorage.removeItem(STORAGE_KEY)
          sessionStorage.removeItem(STORAGE_KEY)
        })
        .addCase(
          refreshToken.fulfilled,
          (state, action: PayloadAction<AuthInfo>) => {
            state.info = action.payload
            state.status = 'AUTHORIZED'

            const serialized = JSON.stringify(action.payload)

            if (state.keepLogin) {
              if (localStorage.getItem(STORAGE_KEY) !== serialized)
                localStorage.setItem(STORAGE_KEY, serialized)
            } else if (sessionStorage.getItem(STORAGE_KEY) !== serialized)
              sessionStorage.setItem(STORAGE_KEY, serialized)
          }
        )
        .addCase(revokeToken.fulfilled, (state, _action) => {
          state.info = undefined
          state.keepLogin = false
          state.status = 'UNAUTHORIZED'

          localStorage.removeItem(STORAGE_KEY)
          sessionStorage.removeItem(STORAGE_KEY)
        })
    }
  })

export const authSlice = createAuthSlice(initialState)

export const { setToken, resetToken, updateRefreshToken } = authSlice.actions

export const selectIsAuthenticatedAndActive = (state: RootState) => {
  if (
    !state.auth.info ||
    state.auth.status === 'UNAUTHORIZED' ||
    state.auth.status === 'EXPIRED'
  )
    return false

  if (
    isPast(state.auth.info.payload.exp * 1000) &&
    state.auth.status !== 'REFRESHING'
  )
    return false

  return true
}

export const selectIsAuthenticated = (state: RootState) => !!state.auth.info

export const selectExpiration = (state: RootState) => state.auth.info?.payload.exp

export const selectAuthStatus = (state: RootState) => state.auth.status

export default authSlice.reducer
