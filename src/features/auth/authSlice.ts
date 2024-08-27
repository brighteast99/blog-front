import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { formatRefreshToken, refresh, revoke } from 'utils/Auth'
import { isPast } from 'utils/dayJS'

import type { RootState } from 'app/store'
import type { AuthInfo } from 'types/auth'

export const STORAGE_KEY = 'refreshToken'

type AuthStatus = 'UNAUTHORIZED' | 'AUTHORIZED' | 'REFRESHING' | 'EXPIRED'

interface AuthState {
  info?: AuthInfo
  status: AuthStatus
}

const initialState: AuthState = {
  info: undefined,
  status: 'UNAUTHORIZED'
}

export const refreshToken = createAsyncThunk<
  AuthInfo,
  any,
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
      console.dir(err)
      return thunkAPI.rejectWithValue(err)
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
      setToken: (state, action: PayloadAction<AuthInfo>) => {
        state.info = action.payload

        if (action.payload) {
          if (isPast(action.payload.payload.exp * 1000))
            state.status = 'EXPIRED'
          else state.status = 'AUTHORIZED'
        } else state.status = 'UNAUTHORIZED'

        if (localStorage.getItem(STORAGE_KEY))
          localStorage.setItem(
            STORAGE_KEY,
            `${action.payload.refreshToken};${action.payload.refreshExpiresIn}`
          )
        else if (sessionStorage.getItem(STORAGE_KEY))
          sessionStorage.setItem(
            STORAGE_KEY,
            `${action.payload.refreshToken};${action.payload.refreshExpiresIn}`
          )
      },
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
          state.status = 'UNAUTHORIZED'

          localStorage.removeItem(STORAGE_KEY)
          sessionStorage.removeItem(STORAGE_KEY)
        })
        .addCase(
          refreshToken.fulfilled,
          (state, action: PayloadAction<AuthInfo>) => {
            state.info = action.payload
            state.status = 'AUTHORIZED'

            const token = formatRefreshToken(
              action.payload.refreshToken,
              action.payload.refreshExpiresIn
            )

            if (localStorage.getItem(STORAGE_KEY))
              localStorage.setItem(STORAGE_KEY, token)
            else if (sessionStorage.getItem(STORAGE_KEY))
              sessionStorage.setItem(STORAGE_KEY, token)
          }
        )
        .addCase(revokeToken.fulfilled, (state, _action) => {
          state.info = undefined
          state.status = 'UNAUTHORIZED'

          localStorage.removeItem(STORAGE_KEY)
          sessionStorage.removeItem(STORAGE_KEY)
        })
    }
  })

export const authSlice = createAuthSlice(initialState)

export const { setToken, updateRefreshToken } = authSlice.actions

export const selectIsAuthenticated = (state: RootState) => {
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

export default authSlice.reducer
