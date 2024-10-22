import { useCallback, useState } from 'react'

import { cn } from 'utils/handleClassName'

import { mdiClose } from '@mdi/js'
import { Badge } from 'components/Badge'
import { IconButton } from 'components/Buttons/IconButton'

import type { FC, HTMLAttributes, KeyboardEvent } from 'react'

interface ComboboxProps
  extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string[]
  disabled?: boolean
  inputKeys?: string[]
  onChange?: (value: string[]) => any
  onInputChange?: (input: string) => any
}

export const Combobox: FC<ComboboxProps> = ({
  className = '',
  value = [],
  disabled,
  inputKeys = [' ', 'Enter'],
  onChange,
  onInputChange,
  ...props
}) => {
  const [input, setInput] = useState<string>('')

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement

      if (e.key === 'Backspace' && !target.value) {
        if (value.length) setInput(() => value.slice(-1)[0] + ' ')
        onChange?.(value.slice(0, -1))
        return
      }

      if (!inputKeys.includes(e.key)) return

      const newVal = target.value.trim()
      if (newVal && !value.includes(newVal)) {
        onChange?.([...value, newVal])
        setInput('')
      }
    },
    [onChange, inputKeys, value]
  )

  return (
    <div
      className={cn(
        'flex flex-wrap overflow-y-auto border-b border-neutral-400 bg-transparent py-1',
        !disabled &&
          'transition-colors hover:border-neutral-600 focus:border-primary focus:outline-none',
        className
      )}
    >
      {value.map((val) => (
        <Badge key={val} size='sm' className='mx-1'>
          {val}
          <IconButton
            className='inline-block p-0'
            color='error'
            variant='hover-text'
            path={mdiClose}
            size='1em'
            onClick={() => {
              const index = value.findIndex((_val) => _val === val)
              console.log(index)

              onChange?.(value.toSpliced(index, 1))
            }}
          />
        </Badge>
      ))}
      <input
        className='min-w-20 grow border-none'
        {...props}
        type='text'
        value={input}
        onKeyDown={handleKeyDown}
        size={1}
        onChange={(e) => {
          if (e.target.value.endsWith(' ')) return

          setInput(e.target.value)
          onInputChange?.(e.target.value)
        }}
      />
    </div>
  )
}
