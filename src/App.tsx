import { useCallback, useLayoutEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet } from 'react-router-dom'
import { throttle } from 'throttle-debounce'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { refreshToken, selectIsAuthenticated } from 'features/auth/authSlice'
import { Sidebar } from 'features/sidebar/Sidebar'
import { SidebarHandle } from 'features/sidebar/SidebarHandle'
import { selectBreakpoint, updateSize } from 'features/window/windowSlice'
import { Error } from 'components/Error'

function App() {
  const dispatch = useAppDispatch()
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const [refreshLoginTimer, setRefreshLoginTimer] =
    useState<ReturnType<typeof setInterval>>()
  const breakpoint = useAppSelector(selectBreakpoint)

  const refreshLoginToken = useCallback(() => {
    dispatch(refreshToken(null))
  }, [dispatch])

  useLayoutEffect(() => {
    const dispatchSizeUpdate = throttle(250, () => {
      dispatch(
        updateSize({
          size: { height: window.innerHeight, width: window.innerWidth }
        })
      )
    })

    window.addEventListener('resize', dispatchSizeUpdate)

    return () => {
      window.removeEventListener('resize', dispatchSizeUpdate)
    }
  }, [dispatch])

  useLayoutEffect(() => {
    document.documentElement.style.fontSize =
      breakpoint === 'mobile' ? '12px' : '16px'
  }, [breakpoint])

  useLayoutEffect(() => {
    if (!isLoggedIn) {
      if (refreshLoginTimer) clearInterval(refreshLoginTimer)
      setRefreshLoginTimer(undefined)
      return
    }

    if (!refreshLoginTimer)
      setRefreshLoginTimer(setInterval(refreshLoginToken, 1000 * 290))
  }, [dispatch, isLoggedIn, refreshLoginTimer, refreshLoginToken])

  useLayoutEffect(() => {
    const refreshLogin = () => {
      if (!document.hidden && isLoggedIn) return refreshLoginToken()
    }
    document.addEventListener('visibilitychange', refreshLogin)

    return () => document.removeEventListener('visibilitychange', refreshLogin)
  }, [isLoggedIn, refreshLoginToken])

  return (
    <div className='flex size-full min-h-[720px] bg-background text-foreground'>
      <Sidebar
        foldable={breakpoint !== 'desktop'}
        float={breakpoint === 'mobile'}
      />

      <div className='relative size-full min-w-0 flex-1 overflow-y-auto bg-background'>
        <div className='fixed z-40 h-full'>
          {breakpoint !== 'desktop' && (
            <SidebarHandle className='absolute inset-y-0 left-4 my-auto' />
          )}
        </div>

        <ErrorBoundary fallback={<Error />}>
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default App
