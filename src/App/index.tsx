import { useLayoutEffect, useMemo } from 'react'
import clsx from 'clsx'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet } from 'react-router-dom'
import { throttle } from 'throttle-debounce'

import { useAppDispatch, useAppSelector } from 'store/hooks'
import {
  selectBreakpoint,
  updateBreakpoint
} from 'store/slices/window/windowSlice'
import { useToggle } from 'hooks/useToggle'

import { Error } from 'components/Error'
import { Sidebar } from 'components/sidebar'
import { SidebarHandle } from 'components/sidebar/SidebarHandle'
import { useAuth, usePageMeta } from './hooks'

function App() {
  usePageMeta()
  useAuth()
  const dispatch = useAppDispatch()
  const breakpoint = useAppSelector(selectBreakpoint)
  const {
    value: sidebarFolded,
    setValue: setSidebarFolded,
    setTrue: fold,
    toggle
  } = useToggle(breakpoint === 'mobile')
  const sidebarFoldable = useMemo(() => breakpoint !== 'desktop', [breakpoint])

  // * Update window size
  useLayoutEffect(() => {
    const dispatchSizeUpdate = throttle(250, () =>
      dispatch(updateBreakpoint({ width: window.innerWidth }))
    )

    window.addEventListener('resize', dispatchSizeUpdate)

    return () => window.removeEventListener('resize', dispatchSizeUpdate)
  }, [dispatch])

  // * Update font size & sidebar state according to breakpoint
  useLayoutEffect(() => {
    document.documentElement.style.fontSize =
      breakpoint === 'mobile' ? '12px' : '16px'

    setSidebarFolded(sidebarFoldable)
  }, [breakpoint, sidebarFoldable, setSidebarFolded])

  return (
    <div className='min-w-dvw flex min-h-dvh'>
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

        <ErrorBoundary
          FallbackComponent={({ resetErrorBoundary }) => (
            <Error
              actions={[
                {
                  label: '새로고침',
                  handler: resetErrorBoundary
                }
              ]}
            />
          )}
        >
          <Outlet />
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default App
