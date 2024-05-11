import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from 'app/store'
import { AuthInfo } from 'types/auth'
import { isPast } from 'utils/dayJS'
import { refresh, revoke } from 'utils/Auth'

interface AuthState {
  info?: AuthInfo
}

const initialState: AuthState = {
  info: undefined
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
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(
          refreshToken.fulfilled,
          (state, action: PayloadAction<AuthInfo>) => {
            state.info = action.payload
            if (localStorage.getItem('refreshToken'))
              localStorage.setItem('refreshToken', action.payload.refreshToken)
            else if (sessionStorage.getItem('refreshToken'))
              sessionStorage.setItem(
                'refreshToken',
                action.payload.refreshToken
              )
          }
        )
        .addCase(revokeToken.fulfilled, (state, _action) => {
          state.info = undefined
        })
    }
  })

export const authSlice = createAuthSlice(initialState)

export const { setToken } = authSlice.actions

export const selectIsAuthenticated = (state: RootState) => {
  if (!state.auth.info) return false

  if (isPast(state.auth.info.payload.exp * 1000)) return false

  return true
}

export default authSlice.reducer
