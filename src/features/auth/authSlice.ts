import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from 'app/store'
import { AuthInfo } from 'types/auth'
import { isPast } from 'utils/dayJS'
import { refresh, revoke } from 'utils/Auth'

interface AuthState {
  token?: AuthInfo
}

const initialState: AuthState = {
  token: undefined
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
    // token이 undefined인 경우 condition에서 return false
    let token = thunkAPI.getState().auth.token as AuthInfo

    try {
      return await refresh(token.refreshToken)
    } catch (err) {
      return thunkAPI.rejectWithValue(err)
    }
  },
  {
    condition: (_payload, { getState }: { getState: () => RootState }) => {
      const { token } = getState().auth
      if (!token) return false
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
    let token = thunkAPI.getState().auth.token as AuthInfo

    try {
      return await revoke(token.refreshToken)
    } catch (err) {
      return thunkAPI.rejectWithValue(err)
    }
  },
  {
    condition: (_payload, { getState }: { getState: () => RootState }) => {
      const { token } = getState().auth
      if (!token) return false
    }
  }
)

export const createAuthSlice = (initialState: AuthState) =>
  createSlice({
    name: 'auth',
    initialState,
    reducers: {
      setToken: (state, action: PayloadAction<AuthInfo>) => {
        state.token = action.payload
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(
          refreshToken.fulfilled,
          (state, action: PayloadAction<AuthInfo>) => {
            state.token = action.payload
          }
        )
        .addCase(revokeToken.fulfilled, (state, _action) => {
          state.token = undefined
        })
    }
  })

export const authSlice = createAuthSlice(initialState)

export const { setToken } = authSlice.actions

export const selectIsAuthenticated = (state: RootState) => {
  if (!state.auth.token) return false

  if (isPast(state.auth.token.payload.exp * 1000)) return false

  return true
}

export default authSlice.reducer
