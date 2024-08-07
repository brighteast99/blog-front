import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet } from 'react-router-dom'
import { throttle } from 'throttle-debounce'

import { useAppDispatch, useAppSelector } from 'app/hooks'
import { useToggle } from 'hooks/useToggle'
import { refreshToken, selectIsAuthenticated } from 'features/auth/authSlice'
import { selectBreakpoint, updateSize } from 'features/window/windowSlice'

import { Error } from 'components/Error'
import { Sidebar } from 'components/sidebar'
import { SidebarHandle } from 'components/sidebar/SidebarHandle'

function App() {
  const dispatch = useAppDispatch()
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const [refreshLoginTimer, setRefreshLoginTimer] =
    useState<ReturnType<typeof setInterval>>()
  const breakpoint = useAppSelector(selectBreakpoint)
  const {
    value: sidebarFolded,
    setValue: setSidebarFolded,
    setTrue: fold,
    toggle
  } = useToggle(breakpoint === 'mobile')
  const sidebarFoldable = useMemo(() => breakpoint !== 'desktop', [breakpoint])

  const refreshLoginToken = useCallback(
    () => dispatch(refreshToken(null)),
    [dispatch]
  )

  // * Update window size
  useLayoutEffect(() => {
    const dispatchSizeUpdate = throttle(250, () => {
      dispatch(
        updateSize({
          size: { height: window.innerHeight, width: window.innerWidth }
        })
      )
    })

    window.addEventListener('resize', dispatchSizeUpdate)

    return () => window.removeEventListener('resize', dispatchSizeUpdate)
  }, [dispatch])

  useLayoutEffect(() => {}, [])

  // * Update font size & sidebar state according to breakpoint
  useLayoutEffect(() => {
    document.documentElement.style.fontSize =
      breakpoint === 'mobile' ? '12px' : '16px'

    setSidebarFolded(sidebarFoldable)
  }, [breakpoint, sidebarFoldable, setSidebarFolded])

  // * Refresh login token periodically
  useLayoutEffect(() => {
    if (!isLoggedIn) {
      if (refreshLoginTimer) clearInterval(refreshLoginTimer)
      setRefreshLoginTimer(undefined)
      return
    }

    if (!refreshLoginTimer)
      setRefreshLoginTimer(setInterval(refreshLoginToken, 1000 * 290))
  }, [dispatch, isLoggedIn, refreshLoginTimer, refreshLoginToken])

  // * Set eventListener that refreshes login token when user has left and returned to the page
  useLayoutEffect(() => {
    if (!isLoggedIn) return

    const refreshLogin = () => {
      if (!document.hidden) return refreshLoginToken()
    }
    document.addEventListener('visibilitychange', refreshLogin)

    return () => document.removeEventListener('visibilitychange', refreshLogin)
  }, [isLoggedIn, refreshLoginToken])

  return (
    <div className='min-w-dvw flex min-h-dvh bg-background text-foreground'>
      <Sidebar
        foldable={sidebarFoldable}
        isFolded={sidebarFolded}
        useScrim={breakpoint === 'mobile'}
        foldOnLocationChange={breakpoint === 'mobile'}
        fold={fold}
      />
      <div
        id='spacer'
        className={clsx(
          'transition-size',
          breakpoint === 'mobile' || sidebarFolded ? 'w-0' : 'w-72'
        )}
      />

      <div className='relative min-w-0 flex-1 bg-background'>
        <div className='fixed z-40 h-lvh'>
          {sidebarFoldable && (
            <SidebarHandle
              className='absolute inset-y-0 left-4 my-auto'
              sidebarFolded={sidebarFolded}
              toggle={toggle}
            />
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
