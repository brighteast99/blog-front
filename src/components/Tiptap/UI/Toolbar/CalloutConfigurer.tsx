import { useLayoutEffect, useState } from 'react'

import { useToggle } from 'hooks/useToggle'

import { ThemedButton } from 'components/Buttons/ThemedButton'
import { PopoverMenu } from 'components/PopoverMenu'
import { CalloutTypes } from 'components/Tiptap/extensions/Callout'

import type { FC, FormEvent, ReactNode } from 'react'
import type { Placement } from '@floating-ui/react'
import type { CalloutType } from 'components/Tiptap/extensions/Callout'

interface CalloutConfigurerProps {
  className?: string
  active?: boolean
  placement?: Placement
  tooltipPlacement?: Placement
  type?: CalloutType
  description?: string
  children?: ReactNode
  onChange: (language: string) => any
  onDelete: () => any
}

export const CodeBlockConfigurer: FC<CalloutConfigurerProps> = ({
  className = '',
  active = false,
  placement = 'bottom-end',
  tooltipPlacement = 'bottom',
  type: _type = 'info',
  description = '',
  onChange = () => {},
  onDelete = () => {},
  children
}) => {
  const { value: isOpen, setFalse: close, setTrue: open } = useToggle(false)
  const [type, setType] = useState<CalloutType>(_type)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (typeof onChange === 'function') onChange(type)
    close()
  }

  const onClickDelete = () => {
    if (typeof onDelete === 'function') onDelete()
    close()
  }

  useLayoutEffect(() => {
    setType(_type)
  }, [_type])

  return (
    <PopoverMenu
      className={className}
      open={isOpen}
      placement={placement}
      offset={10}
      tooltipPlacement={tooltipPlacement}
      onOpen={open}
      onClose={close}
      menuBtn={
        children || <button>{`콜아웃 ${active ? '편집' : '삽입'}`}</button>
      }
      description={description}
    >
      <div className='w-72 p-2'>
        <form onSubmit={onSubmit}>
          <div className='flex gap-2'>
            <select
              autoFocus
              className='grow'
              name='language'
              value={type}
              onChange={(e) => setType(e.target.value as CalloutType)}
            >
              {CalloutTypes.map((type) => (
                <option key={type} value={type} className='capitalize'>
                  {type}
                </option>
              ))}
            </select>
            <ThemedButton color='primary' type='submit' className='px-2 py-1'>
              확인
            </ThemedButton>
          </div>

          {active && (
            <ThemedButton
              type='button'
              color='error'
              variant='text'
              className='mt-2 block w-full p-1'
              onClick={onClickDelete}
            >
              블록 삭제
            </ThemedButton>
          )}
        </form>
      </div>
    </PopoverMenu>
  )
}
