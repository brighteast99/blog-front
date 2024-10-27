import { useEffect, useState } from 'react'

import { ThemedButton } from 'components/Buttons/ThemedButton'
import { PopoverMenu } from 'components/PopoverMenu'

import type { FC, FormEvent, ReactNode } from 'react'
import type { Placement } from '@floating-ui/react'

export function AttributeSetter<T extends string | number>(
  nodeName: string,
  defaultOption: T,
  options: readonly ({ readonly name: string; readonly value: T } | T)[]
) {
  interface AttributeSetterProps {
    className?: string
    active?: boolean
    placement?: Placement
    tooltipPlacement?: Placement
    option?: T
    children?: ReactNode
    onChange?: (value: T) => any
    onDelete?: () => any
  }
  const _AttributeSetter: FC<AttributeSetterProps> = ({
    className = '',
    active = false,
    placement = 'bottom-end',
    tooltipPlacement = 'bottom',
    option: _option = defaultOption,
    onChange,
    onDelete,
    children
  }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [option, setOption] = useState<T>(_option)

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (typeof onChange === 'function') onChange?.(option)
      setIsOpen(false)
    }

    const onClickDelete = () => {
      if (typeof onDelete === 'function') onDelete()
      setIsOpen(false)
    }

    useEffect(() => {
      setOption(_option)
    }, [_option])

    return (
      <PopoverMenu
        className={className}
        open={isOpen}
        placement={placement}
        offset={10}
        tooltipPlacement={tooltipPlacement}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        menuBtn={
          children || (
            <button>{`${nodeName} ${active ? '편집' : '삽입'}`}</button>
          )
        }
        description={`${nodeName} ${active ? '편집' : '삽입'}`}
      >
        <div className='w-72 p-2'>
          <form onSubmit={onSubmit}>
            <div className='flex gap-2'>
              <select
                autoFocus
                className='grow capitalize'
                name='language'
                value={option}
                onChange={(e) => setOption(e.target.value as T)}
              >
                {options.map((option) => (
                  <option
                    key={typeof option === 'object' ? option?.value : option}
                    value={typeof option === 'object' ? option?.value : option}
                  >
                    {typeof option === 'object' ? option?.name : option}
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
                {nodeName} 삭제
              </ThemedButton>
            )}
          </form>
        </div>
      </PopoverMenu>
    )
  }

  return _AttributeSetter
}
