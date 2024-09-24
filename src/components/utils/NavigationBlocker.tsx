import { useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { useBlocker } from 'react-router-dom'

import { useAppSelector } from 'store/hooks'
import { selectIsAuthenticatedAndActive } from 'store/slices/auth/authSlice'

import { ThemedButton } from 'components/Buttons/ThemedButton'

import type { FC } from 'react'

interface NavigationBlockerProps {
  enabled: boolean
  disableOnLoggedOut?: boolean
  localAlert?: boolean
  message?: string
}

export const NavigationBlocker: FC<NavigationBlockerProps> = ({
  enabled: _enabled,
  disableOnLoggedOut = true,
  localAlert = false,
  message = '페이지를 벗어나시겠습니까?'
}) => {
  const isLoggedIn = useAppSelector(selectIsAuthenticatedAndActive)
  const enabled = useMemo(
    () => _enabled && (!disableOnLoggedOut || isLoggedIn),
    [_enabled, disableOnLoggedOut, isLoggedIn]
  )

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      enabled && currentLocation !== nextLocation
  )

  useEffect(() => {
    const blockLeave = (e: BeforeUnloadEvent) => e.preventDefault()

    if (enabled) window.addEventListener('beforeunload', blockLeave)
    return () => window.removeEventListener('beforeunload', blockLeave)
  }, [enabled])

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
