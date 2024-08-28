import { useCallback, useLayoutEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'app/hooks'
import {
  refreshToken,
  resetToken,
  selectAuthStatus,
  selectNeedRefresh,
  setToken,
  STORAGE_KEY
} from 'features/auth/authSlice'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const authStatus = useAppSelector(selectAuthStatus)
  const [refreshLoginTimer, setRefreshLoginTimer] =
    useState<ReturnType<typeof setInterval>>()
  const needRefresh = useAppSelector(selectNeedRefresh)

  const refreshLoginToken = useCallback(
    () => dispatch(refreshToken()),
    [dispatch]
  )

  const setupTimer = useCallback(() => {
    if (!refreshLoginTimer && document.hasFocus())
      setRefreshLoginTimer(setInterval(refreshLoginToken, 1000 * 3))
  }, [refreshLoginTimer, refreshLoginToken])

  const cleanupTimer = useCallback(() => {
    if (refreshLoginTimer) {
      clearInterval(refreshLoginTimer)
      setRefreshLoginTimer(undefined)
    }
  }, [refreshLoginTimer])

  const startRefreshing = useCallback(() => {
    if (needRefresh) refreshLoginToken()
    setupTimer()
  }, [needRefresh, refreshLoginToken, setupTimer])

  const updateTokenFromStorage = useCallback(() => {
    let data =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)

    if (!data) dispatch(resetToken())
    else dispatch(setToken({ authInfo: JSON.parse(data), keepLogin: true }))
  }, [dispatch])

  useLayoutEffect(() => {
    if (authStatus === 'AUTHORIZED') return

    startRefreshing()
    window.addEventListener('focus', startRefreshing)
    window.addEventListener('blur', cleanupTimer)

    return () => {
      cleanupTimer()
      window.removeEventListener('focus', startRefreshing)
      window.removeEventListener('blur', cleanupTimer)
    }
  }, [authStatus, startRefreshing, cleanupTimer])

  useLayoutEffect(() => {
    window.addEventListener('storage', updateTokenFromStorage)
    return () => window.removeEventListener('storage', updateTokenFromStorage)
  }, [updateTokenFromStorage])
}
