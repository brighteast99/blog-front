import { useCallback, useLayoutEffect } from 'react'

import { useAppDispatch, useAppSelector } from 'store/hooks'
import {
  refreshToken,
  resetToken,
  selectExpiration,
  selectIsAuthenticated,
  setToken,
  STORAGE_KEY
} from 'store/slices/auth/authSlice'
import { isPast } from 'utils/dayJS'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const expiration = useAppSelector(selectExpiration)

  const refreshLoginToken = useCallback(() => {
    if (expiration && isPast(expiration * 1000)) dispatch(refreshToken())
  }, [dispatch, expiration])

  const updateTokenFromStorage = useCallback(() => {
    let data =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)

    if (!data) dispatch(resetToken())
    else dispatch(setToken({ authInfo: JSON.parse(data), keepLogin: true }))
  }, [dispatch])

  useLayoutEffect(() => {
    if (!isAuthenticated) return

    const timer = setInterval(refreshLoginToken, 1000 * 290)
    window.addEventListener('focus', refreshLoginToken)

    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refreshLoginToken)
    }
  }, [isAuthenticated, refreshLoginToken])

  useLayoutEffect(() => {
    window.addEventListener('storage', updateTokenFromStorage)
    return () => window.removeEventListener('storage', updateTokenFromStorage)
  }, [updateTokenFromStorage])
}
