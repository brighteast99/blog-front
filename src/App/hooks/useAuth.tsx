import { useCallback, useLayoutEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'store/hooks'
import {
  refreshToken,
  resetToken,
  selectIsAuthenticated,
  setToken,
  STORAGE_KEY
} from 'store/slices/auth/authSlice'

import type { AuthInfo } from 'types/auth'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [windowFocused, setWindowFocused] = useState<boolean>(true)

  const refreshLoginToken = useCallback(async () => {
    let nextExpiration = 0

    await dispatch(refreshToken()).then((result) => {
      if (result.meta.requestStatus === 'rejected') return
      nextExpiration = (result.payload as AuthInfo).payload.exp * 1000
    })

    return nextExpiration
  }, [dispatch])

  const updateTokenFromStorage = useCallback(() => {
    let data =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)

    if (!data) dispatch(resetToken())
    else dispatch(setToken({ authInfo: JSON.parse(data), keepLogin: true }))
  }, [dispatch])

  useLayoutEffect(() => {
    const updateWindowFocused = (e: FocusEvent) =>
      setWindowFocused(e.type === 'focus')

    window.addEventListener('blur', updateWindowFocused)
    window.addEventListener('focus', updateWindowFocused)

    return () => {
      window.removeEventListener('blur', () => updateWindowFocused)
      window.removeEventListener('focus', () => updateWindowFocused)
    }
  }, [])

  useLayoutEffect(() => {
    if (!isAuthenticated) return

    if (!windowFocused) return

    let timer: ReturnType<typeof setTimeout>
    const refreshControl = (() => {
      const refresh = async () => {
        const timeout = Math.max(0, (await refreshLoginToken()) - Date.now())
        timer = setTimeout(refresh, timeout)
      }

      return async (e: FocusEvent) => {
        if (e.type === 'blur') clearTimeout(timer)
        else await refresh()
      }
    })()
    refreshControl(new FocusEvent('focus'))
    window.addEventListener('focus', refreshControl)
    window.addEventListener('blur', refreshControl)

    return () => {
      refreshControl(new FocusEvent('blur'))
      window.removeEventListener('focus', refreshControl)
      window.removeEventListener('blur', refreshControl)
    }
  }, [isAuthenticated, refreshLoginToken, windowFocused])

  useLayoutEffect(() => {
    window.addEventListener('storage', updateTokenFromStorage)
    return () => window.removeEventListener('storage', updateTokenFromStorage)
  }, [updateTokenFromStorage])
}
