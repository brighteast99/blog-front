import { createContext, useCallback, useContext, useState } from 'react'
import { FloatingOverlay } from '@floating-ui/react'

import { useNavigationBlocker } from 'hooks/useNavigationBlocker'

import { ThemedButton } from 'components/Buttons/ThemedButton'

import type { FC, ReactNode } from 'react'
import type { ButtonVariant } from 'components/Buttons/ThemedButton'
import type { NamedColors } from 'types/commonProps'

export type DialogAction<T> =
  | string
  | { label: string; value: T; color?: NamedColors; variant?: ButtonVariant }

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

const DialogContext = createContext<
  (
    message: string,
    actions?: DialogType | DialogAction<any>[]
  ) => Promise<unknown>
>((_message, _acions) => new Promise((resolve) => resolve(undefined)))

export const useDialog = () => {
  return useContext(DialogContext)
}

export const defaultActions: { [key in DialogType]: DialogAction<any>[] } = {
  ALERT: ['확인'],
  CONFIRM: [
    { label: '취소', value: false, color: 'error', variant: 'text' },
    { label: '확인', value: true }
  ],
  NEGATIVECONFIRM: [
    { label: '취소', value: false },
    { label: '확인', value: true, color: 'error', variant: 'text' }
  ],
  YESNO: [
    { label: '아니요', value: false },
    { label: '예', value: true }
  ],
  YESNOCANCEL: [
    { label: '취소', value: null, color: 'error', variant: 'text' },
    { label: '아니요', value: false },
    { label: '예', value: true }
  ],
  NEGATIVEYESNOCANCEL: [
    { label: '취소', value: null },
    { label: '아니요', value: false },
    { label: '예', value: true, color: 'error', variant: 'text' }
  ]
}

export const DialogProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [dialogType, setDialogType] = useState<DialogType>('ALERT')
  const [actions, setActions] = useState<DialogAction<any>[] | undefined>(
    undefined
  )
  const [resolver, setResolver] = useState<
    ((value: unknown) => void) | undefined
  >(undefined)
  const { block, unblock } = useNavigationBlocker('dialog')

  const showDialog = useCallback(
    (message: string, actions: DialogType | DialogAction<any>[] = 'ALERT') => {
      setMessage(message)
      if (isDialogType(actions)) setDialogType(actions)
      else setActions(actions)
      block()
      setOpen(true)
      return new Promise((resolve) => {
        setResolver(() => resolve)
      })
    },
    [block]
  )

  const onClick = useCallback(
    (value?: any) => {
      resolver?.(value)
      setOpen(false)
      unblock()

      setMessage('')
      setDialogType('ALERT')
      setActions(undefined)
      setResolver(undefined)
    },
    [resolver, unblock]
  )

  return (
    <DialogContext.Provider value={showDialog}>
      {children}
      {open && (
        <FloatingOverlay
          className='z-50 bg-neutral-50 bg-opacity-25'
          lockScroll
        >
          <div className='absolute inset-0 z-50 m-auto flex size-fit min-h-40 min-w-80 max-w-[50%] flex-col overflow-hidden rounded-lg bg-background shadow-lg shadow-neutral-50'>
            <div className='flex grow items-center justify-center whitespace-pre text-balance px-5 py-10 text-center'>
              {message}
            </div>
            <div className='flex *:min-w-32 *:grow *:rounded-none *:py-4'>
              {(actions ?? defaultActions[dialogType]).map((action) => {
                if (typeof action === 'string')
                  return (
                    <ThemedButton
                      key={action}
                      color='primary'
                      variant='text'
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
      )}
    </DialogContext.Provider>
  )
}
