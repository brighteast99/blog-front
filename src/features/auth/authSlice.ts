import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from 'app/store'
import { AuthInfo } from 'types/auth'
import { isFuture, isPast } from 'utils/dayJS'
import { refreshToken as _refreshToken } from 'utils/Auth'

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
      return await _refreshToken(token.token)
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
        const token = action.payload

        if (isPast(token.payload.exp * 1000)) return

        state.token = action.payload
      },
      resetToken: (state) => {
        state.token = undefined
        localStorage.removeItem('token')
      }
    },
    extraReducers: (builder) => {
      builder.addCase(
        refreshToken.fulfilled,
        (state, action: PayloadAction<AuthInfo>) => {
          if (!state.token) return
          state.token.token = action.payload.token
          state.token.payload.exp = action.payload.payload.exp
        }
      )
    }
  })

export const authSlice = createAuthSlice(initialState)

export const { setToken, resetToken } = authSlice.actions

export const selectIsAuthenticated = (state: RootState) => {
  if (!state.auth.token) return false

  if (isPast(state.auth.token.payload.exp * 1000)) return false

  return true
}

export const selectIsExpired = (state: RootState) => {
  if (!state.auth.token) return true
  if (isPast(state.auth.token.payload.exp * 1000)) return true

  return false
}

export const selectCanRefresh = (state: RootState) => {
  if (!state.auth.token) return false
  return isFuture(state.auth.token.refreshExpiresIn * 1000)
}

export default authSlice.reducer
