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
import { useBlocker } from 'react-router-dom'

import { Dialog } from 'hooks/useDialog'

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

  const unregisterBlocker = useCallback((id: string) => {
    blockingSrcs.current.delete(id)
    setEnableBlock(blockingSrcs.current.size > 0)
  }, [])

  const resetOrProceed = useCallback(
    (proceed: boolean) => {
      if (proceed) return blocker.proceed?.()
      else return blocker.reset?.()
    },
    [blocker]
  )

  useEffect(() => {
    const blockLeave = (e: BeforeUnloadEvent) => e.preventDefault()
    if (enableBlock) window.addEventListener('beforeunload', blockLeave)

    return () => window.removeEventListener('beforeunload', blockLeave)
  }, [enableBlock])

  useEffect(() => {
    if (!enableBlock) blocker.reset?.()
  }, [blocker, enableBlock])

  return (
    <BlockerContext.Provider value={{ registerBlocker, unregisterBlocker }}>
      {children}
      <Dialog
        open={
          blocker.state === 'blocked' && !blockingSrcs.current.has('dialog')
        }
        message={`저장되지 않은 변경 사항이 있습니다.\n계속하시겠습니까?`}
        actions={[
          {
            label: '머무르기',
            value: false,
            keys: ['Escape', 'Backspace', 'N', 'n']
          },
          {
            label: '페이지 이동',
            value: true,
            color: 'error',
            variant: 'text',
            keys: ['Enter', ' ']
          }
        ]}
        onClick={resetOrProceed}
      />
    </BlockerContext.Provider>
  )
}
