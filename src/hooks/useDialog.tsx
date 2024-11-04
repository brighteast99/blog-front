import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState
} from 'react'
import { FloatingOverlay } from '@floating-ui/react'
import clsx from 'clsx'

import { useNavigationBlocker } from 'hooks/useNavigationBlocker'

import { ThemedButton } from 'components/Buttons/ThemedButton'

import type { FC, Key, ReactNode } from 'react'
import type { ButtonVariant } from 'components/Buttons/ThemedButton'
import type { NamedColors } from 'types/commonProps'

export type DialogAction<T> =
  | string
  | {
      label: string
      value: T
      color?: NamedColors
      variant?: ButtonVariant
      keys?: Key[]
    }

const DialogTypes = [
  'ALERT',
  'CONFIRM',
  'NEGATIVECONFIRM',
  'YESNO',
  'YESNOCANCEL',
  'NEGATIVEYESNOCANCEL'
] as const
export type DialogType = (typeof DialogTypes)[number]
const isDialogType = (val: any): val is DialogType => DialogTypes.includes(val)

export interface DialogOptions {
  persist?: boolean
}

const DialogContext = createContext<
  (
    message: string,
    actions?: DialogType | DialogAction<any>[],
    options?: DialogOptions
  ) => Promise<unknown>
>((_message, _acions) => new Promise((resolve) => resolve(undefined)))

export const useDialog = () => {
  return useContext(DialogContext)
}

export const defaultActions: { [key in DialogType]: DialogAction<any>[] } = {
  ALERT: ['확인'],
  CONFIRM: [
    {
      label: '취소',
      value: false,
      color: 'error',
      variant: 'text',
      keys: ['Escape', 'Backspace']
    },
    { label: '확인', value: true, keys: ['Enter', ' '] }
  ],
  NEGATIVECONFIRM: [
    { label: '취소', value: false, keys: ['Escape', 'Backspace'] },
    {
      label: '확인',
      value: true,
      color: 'error',
      variant: 'text',
      keys: ['Enter', ' ']
    }
  ],
  YESNO: [
    {
      label: '아니요',
      value: false,
      keys: ['Escape', 'Backspace', 'N', 'n']
    },
    {
      label: '예',
      value: true,
      keys: ['Enter', ' ', 'Y', 'y']
    }
  ],
  YESNOCANCEL: [
    {
      label: '취소',
      value: null,
      color: 'error',
      variant: 'text',
      keys: ['Escape', 'Backspace']
    },
    { label: '아니요', value: false, keys: ['N', 'n'] },
    {
      label: '예',
      value: true,
      keys: ['Enter', ' ', 'Y', 'y']
    }
  ],
  NEGATIVEYESNOCANCEL: [
    { label: '취소', value: null, keys: ['Escape', 'Backspace'] },
    { label: '아니요', value: false, keys: ['N', 'n'] },
    {
      label: '예',
      value: true,
      color: 'error',
      variant: 'text',
      keys: ['Enter', ' ', 'Y', 'y']
    }
  ]
}

export const Dialog: FC<{
  open: boolean
  message?: string
  persist?: boolean
  actions: DialogAction<any>[]
  onClick: (_value?: any) => any
}> = ({ open, message, persist, onClick, actions }) => {
  useLayoutEffect(() => {
    if (!open || persist) return

    const dismiss = (e: KeyboardEvent) => {
      for (const action of actions) {
        if (typeof action === 'string') continue

        if (action.keys?.includes(e.key)) return onClick(action.value)
      }

      if (['Escape', 'Backspace'].includes(e.key)) return onClick()
    }

    window.addEventListener('keydown', dismiss)

    return () => {
      window.removeEventListener('keydown', dismiss)
    }
  }, [open, persist, actions, onClick])

  return (
    <FloatingOverlay
      className={clsx(
        'z-50 bg-neutral-950 bg-opacity-25 transition-opacity',
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      lockScroll={open}
      onClick={
        persist
          ? undefined
          : (e) => {
              if (e.target === e.currentTarget) onClick()
            }
      }
      style={{ transitionDuration: '50ms' }}
    >
      <div className='absolute inset-0 z-50 m-auto flex size-fit min-h-40 min-w-80 max-w-[50%] flex-col overflow-hidden rounded-lg bg-background shadow-lg shadow-neutral-50'>
        <div className='flex grow items-center justify-center whitespace-pre text-balance p-5 text-center'>
          {message}
        </div>
        <div className='*-focused:outline flex *:min-w-32 *:grow *:rounded-none *:py-3'>
          {actions.map((action) => {
            if (typeof action === 'string')
              return (
                <ThemedButton
                  key={action}
                  color='primary'
                  variant='hover-text'
                  onClick={() => onClick(action)}
                >
                  {action}
                </ThemedButton>
              )

            return (
              <ThemedButton
                key={action.value}
                color={action.color ?? 'primary'}
                variant={action.variant ?? 'hover-text'}
                onClick={() => onClick(action.value)}
              >
                {action.label}
              </ThemedButton>
            )
          })}
        </div>
      </div>
    </FloatingOverlay>
  )
}

export const DialogProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [dialogType, setDialogType] = useState<DialogType>('ALERT')
  const [persist, setPersist] = useState<boolean>(false)
  const [actions, setActions] = useState<DialogAction<any>[] | undefined>(
    undefined
  )
  const [resolver, setResolver] = useState<
    ((value: unknown) => void) | undefined
  >(undefined)
  const { block, unblock } = useNavigationBlocker('dialog')

  const showDialog = useCallback(
    (
      message: string,
      actions: DialogType | DialogAction<any>[] = 'ALERT',
      options: DialogOptions = { persist: false }
    ) => {
      setMessage(message)
      if (isDialogType(actions)) setDialogType(actions)
      else setActions(actions)
      block()
      setOpen(true)
      setPersist(Boolean(options?.persist))

      return new Promise((resolve) => {
        setResolver(() => resolve)
      })
    },
    [block]
  )

  const resolve = useCallback(
    (value?: any) => {
      resolver?.(value)
      setResolver(undefined)
      setOpen(false)

      setTimeout(() => {
        setMessage('')
        setDialogType('ALERT')
        setActions(undefined)
        unblock()
      }, 150)
    },
    [resolver, unblock]
  )

  return (
    <DialogContext.Provider value={showDialog}>
      {children}
      <Dialog
        open={open}
        message={message}
        persist={persist}
        actions={actions ?? defaultActions[dialogType]}
        onClick={resolve}
      />
    </DialogContext.Provider>
  )
}
