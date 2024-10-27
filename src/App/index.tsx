import { Suspense, useLayoutEffect, useState } from 'react'
import clsx from 'clsx'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet } from 'react-router-dom'
import { throttle } from 'throttle-debounce'

import { useAppDispatch, useAppSelector } from 'store/hooks'
import {
  selectBreakpoint,
  updateBreakpoint
} from 'store/slices/window/windowSlice'

import { Error } from 'components/Error'
import { Sidebar } from 'components/sidebar'
import { SidebarHandle } from 'components/sidebar/SidebarHandle'
import { Spinner } from 'components/Spinner'
import { useAuth, usePageMeta } from './hooks'

export default function App() {
  usePageMeta()
  useAuth()
  const dispatch = useAppDispatch()
  const breakpoint = useAppSelector(selectBreakpoint)
  const [sidebarFolded, setSidebarFolded] = useState<boolean>(
    breakpoint === 'mobile'
  )

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
      breakpoint === 'mobile' ? '12px' : '14px'

    setSidebarFolded(breakpoint === 'mobile')
  }, [breakpoint, setSidebarFolded])

  return (
    <div className='min-w-dvw flex min-h-dvh'>
      <Sidebar
        foldable
        isFolded={sidebarFolded}
        useScrim={breakpoint === 'mobile'}
        foldOnLocationChange={breakpoint === 'mobile'}
        fold={() => setSidebarFolded(true)}
      />
      <div
        id='spacer'
        className={clsx(
          'transition-size will-change-transform',
          breakpoint === 'mobile' || sidebarFolded ? 'w-0' : 'w-72'
        )}
      />

      <div className='relative min-w-0 flex-1 bg-background'>
        <div className='fixed z-40 h-lvh'>
          <SidebarHandle
            className='absolute inset-y-0 left-4 my-auto'
            sidebarFolded={sidebarFolded}
            toggle={() => setSidebarFolded((prev) => !prev)}
          />
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
          <Suspense
            fallback={
              <div className='relative size-full bg-neutral-50 bg-opacity-50'>
                <Spinner className='absolute inset-0' size='2xl' />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
