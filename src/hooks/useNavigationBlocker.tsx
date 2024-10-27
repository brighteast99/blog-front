import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { FloatingOverlay } from '@floating-ui/react'
import { useBlocker } from 'react-router-dom'

import { ThemedButton } from 'components/Buttons/ThemedButton'

import type { FC, ReactNode } from 'react'

const BlockerContext = createContext<{
  registerBlocker: (id: string) => void
  unregisterBlocker: (id: string) => void
}>({ registerBlocker: (_id) => {}, unregisterBlocker: (_id) => {} })

export const useNavigationBlocker = (givenId?: string) => {
  const randomId = useId()
  const id = useMemo(() => givenId ?? randomId, [givenId, randomId])
  const { registerBlocker, unregisterBlocker } = useContext(BlockerContext)

  useLayoutEffect(() => {
    return () => unregisterBlocker(id)
  }, [id, unregisterBlocker])

  return {
    block: () => registerBlocker(id),
    unblock: () => unregisterBlocker(id)
  }
}

export const NavigationBlockerProvider: FC<{ children: ReactNode }> = ({
  children
}) => {
  const blockingSrcs = useRef<Set<string>>(new Set())
  const [enableBlock, setEnableBlock] = useState<boolean>(false)

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      blockingSrcs.current.size > 0 && currentLocation !== nextLocation
  )

  const registerBlocker = useCallback((id: string) => {
    blockingSrcs.current.add(id)
    setEnableBlock(blockingSrcs.current.size > 0)
  }, [])

  const unregisterBlocker = useCallback(
    (id: string) => {
      blockingSrcs.current.delete(id)
      setEnableBlock(blockingSrcs.current.size > 0)
      if (blockingSrcs.current.size === 0) blocker.reset?.()
    },
    [blocker]
  )

  useEffect(() => {
    const blockLeave = (e: BeforeUnloadEvent) => e.preventDefault()
    if (enableBlock) window.addEventListener('beforeunload', blockLeave)

    return () => window.removeEventListener('beforeunload', blockLeave)
  }, [enableBlock])

  // useEffect(() => {
  //   if (!enableBlock) blocker.reset?.()
  // }, [blocker, enableBlock])

  return (
    <BlockerContext.Provider value={{ registerBlocker, unregisterBlocker }}>
      {children}
      {blocker.state === 'blocked' && !blockingSrcs.current.has('dialog') && (
        <FloatingOverlay
          className='z-50 bg-neutral-50 bg-opacity-50'
          lockScroll
        >
          <div className='absolute inset-0 z-50 m-auto h-fit w-1/5 min-w-80 flex-col overflow-hidden rounded-lg bg-background shadow-lg shadow-neutral-50'>
            <div className='flex items-center justify-center whitespace-pre px-5 py-10 text-center'>
              저장되지 않은 변경 사항이 있습니다.
              <br />
              계속하시겠습니까?
            </div>
            <div className='flex'>
              <ThemedButton
                color='error'
                variant='text'
                className='h-10 w-1/2 rounded-none'
                onClick={blocker.proceed}
              >
                페이지 이동
              </ThemedButton>
              <ThemedButton
                color='unset'
                variant='hover-text'
                className='h-10 w-1/2 rounded-none'
                onClick={blocker.reset}
                autoFocus
              >
                머무르기
              </ThemedButton>
            </div>
          </div>
        </FloatingOverlay>
      )}
    </BlockerContext.Provider>
  )
}
