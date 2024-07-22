import { FC, useCallback, useLayoutEffect, useMemo } from 'react'
import { useBlocker } from 'react-router-dom'

import clsx from 'clsx'

import { useAppSelector } from 'app/hooks'

import { selectIsAuthenticated } from 'features/auth/authSlice'

import { ThemedButton } from 'components/Buttons/ThemedButton'

interface usePromptProps {
  enabled: boolean
  disableOnLoggedOut?: boolean
  localAlert?: boolean
  message?: string
}

export const NavigationBlocker: FC<usePromptProps> = ({
  enabled: _enabled,
  disableOnLoggedOut = true,
  localAlert = false,
  message = '페이지를 벗어나시겠습니까?'
}) => {
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const enabled = useMemo(
    () => _enabled && (!disableOnLoggedOut || isLoggedIn),
    [_enabled, disableOnLoggedOut, isLoggedIn]
  )

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      enabled && currentLocation !== nextLocation
  )

  const blockLeave = useCallback((e: BeforeUnloadEvent) => {
    e.preventDefault()
  }, [])

  useLayoutEffect(() => {
    if (enabled) window.addEventListener('beforeunload', blockLeave)
    return () => window.removeEventListener('beforeunload', blockLeave)
  }, [blockLeave, enabled])

  if (blocker.state !== 'blocked') return null

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 bg-neutral-950 bg-opacity-25',
        localAlert ? 'absolute size-full' : 'fixed h-dvh w-dvw'
      )}
    >
      <div
        className={clsx(
          'margin-auto inset-1/2 z-50 h-fit w-1/5 min-w-80 -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-background shadow-lg shadow-neutral-50',
          localAlert ? 'absolute' : 'fixed'
        )}
      >
        <div className='flex items-center justify-center whitespace-pre px-5 py-10 text-center'>
          {message}
        </div>
        <div className='flex'>
          <ThemedButton
            color='unset'
            variant='hover-text'
            className='h-10 w-1/2 rounded-none'
            onClick={blocker.reset}
            autoFocus
          >
            취소
          </ThemedButton>
          <ThemedButton
            color='error'
            variant='text'
            className='h-10 w-1/2 rounded-none'
            onClick={blocker.proceed}
          >
            확인
          </ThemedButton>
        </div>
      </div>
    </div>
  )
}
