import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from 'app/store'
import { AuthInfo } from 'types/auth'
import { isPast } from 'utils/dayJS'
import { refresh, revoke } from 'utils/Auth'

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
          localStorage.setItem(STORAGE_KEY, action.payload.refreshToken)
        else if (sessionStorage.getItem(STORAGE_KEY))
          sessionStorage.setItem(STORAGE_KEY, action.payload.refreshToken)
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

            if (localStorage.getItem(STORAGE_KEY))
              localStorage.setItem(STORAGE_KEY, action.payload.refreshToken)
            else if (sessionStorage.getItem(STORAGE_KEY))
              sessionStorage.setItem(STORAGE_KEY, action.payload.refreshToken)
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

export const { setToken } = authSlice.actions

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
