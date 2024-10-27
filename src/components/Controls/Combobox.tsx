import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  size,
  useDismiss,
  useFloating,
  useFocus,
  useInteractions,
  useListNavigation,
  useRole
} from '@floating-ui/react'
import clsx from 'clsx'

import { cn } from 'utils/handleClassName'

import { mdiClose } from '@mdi/js'
import { Badge } from 'components/Badge'
import { IconButton } from 'components/Buttons/IconButton'
import { Spinner } from 'components/Spinner'

import type { ChangeEvent, FC, HTMLAttributes, KeyboardEvent } from 'react'

interface ComboboxProps
  extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> {
  placeholder?: string
  name?: string
  value?: string[]
  items?: string[]
  allowNewValue?: boolean
  disabled?: boolean
  loading?: boolean
  onChange?: (value: string[]) => any
  onInputChange?: (input: string) => any
}

export const Combobox: FC<ComboboxProps> = ({
  className = '',
  placeholder = '',
  name = '항목',
  value = [],
  items = [],
  allowNewValue,
  disabled,
  loading,
  onChange,
  onInputChange,
  ...props
}) => {
  const areaRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<Array<HTMLElement | null>>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const [input, setInput] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)

  const { refs, floatingStyles, context, placement } = useFloating({
    placement: 'bottom',
    whileElementsMounted: autoUpdate,
    open,
    onOpenChange: setOpen,
    middleware: [
      flip({ padding: 10 }),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            minHeight: '48px',
            maxHeight: `${availableHeight}px`
          })
        },
        padding: 10
      })
    ]
  })

  const role = useRole(context, { role: 'listbox' })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
    virtual: true
  })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [role, focus, dismiss, listNavigation]
  )

  const toggleItem = useCallback(
    (item: string) => {
      if (value.includes(item))
        onChange?.(value.toSpliced(value.indexOf(item), 1))
      else {
        onChange?.([...value, item])
        setInput('')
      }
    },
    [value, onChange]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement

      if (e.key === 'Backspace' && !target.value) {
        if (value.length) setInput(() => value.slice(-1)[0] + ' ')
        onChange?.(value.slice(0, -1))
        return
      }

      if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
      e.preventDefault()

      if (activeIndex != null && items[activeIndex])
        return toggleItem(items[activeIndex])

      const match = items.find(
        (item) => item.toLocaleLowerCase() === input.toLocaleLowerCase()
      )
      if (match) return toggleItem(match)

      if (allowNewValue && input.trim().length > 0) {
        return toggleItem(input.trim())
      }
    },
    [onChange, value, activeIndex, items, toggleItem, allowNewValue, input]
  )

  useLayoutEffect(() => {
    onInputChange?.(input)
  }, [input, onInputChange])

  return (
    <>
      <div
        ref={areaRef}
        className={cn(
          'flex flex-wrap overflow-y-auto border-b border-neutral-400 bg-transparent',
          !disabled &&
            'transition-colors hover:border-neutral-600 focus:border-primary focus:outline-none',
          className
        )}
        {...getReferenceProps({
          ref: refs.setReference,
          'aria-autocomplete': 'list'
        })}
      >
        {value.map((val) => (
          <Badge key={val} size='sm' className='mr-1'>
            {val}
            <IconButton
              className='inline-block p-0'
              color='error'
              variant='hover-text'
              path={mdiClose}
              size='1em'
              tabIndex={-1}
              onClick={() => onChange?.(value.toSpliced(value.indexOf(val), 1))}
            />
          </Badge>
        ))}
        <input
          className='min-w-20 grow border-none p-1'
          value={input}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          {...props}
          type='text'
          size={1}
        />
      </div>
      <FloatingPortal>
        {open && (
          <FloatingFocusManager
            context={context}
            initialFocus={-1}
            visuallyHiddenDismiss
          >
            <div
              className={clsx(
                'z-10 overflow-y-auto border border-neutral-400 bg-neutral-100',
                placement === 'top' && '-mt-1 rounded',
                placement === 'bottom' && 'rounded-b border-t-0'
              )}
              {...getFloatingProps({
                ref: refs.setFloating,
                style: floatingStyles
              })}
            >
              {items.map((item, index) => {
                const included = value.includes(item)
                const focused = index === activeIndex
                return (
                  <div
                    key={item}
                    className={clsx(
                      'bg-opacity-25 px-2 py-1',
                      included && 'bg-primary text-primary brightness-75',
                      focused &&
                        'bg-primary text-primary underline !brightness-125'
                    )}
                    {...getItemProps({
                      ref(node) {
                        listRef.current[index] = node
                      },
                      onClick: () => toggleItem(item)
                    })}
                  >
                    {item}
                  </div>
                )
              })}
              {loading && <Spinner className='my-1' size='xs' />}
              {!loading && !allowNewValue && items.length === 0 && (
                <div className='relative h-12 px-2 py-1'>
                  <span className='absolute inset-0 m-auto block size-fit text-neutral-600'>{`일치하는 ${name} 없음`}</span>
                </div>
              )}
              {allowNewValue && input.trim() && !items.includes(input) && (
                <div
                  className={clsx(
                    'bg-opacity-25 px-2 py-1',
                    activeIndex === items.length &&
                      'bg-primary underline brightness-125'
                  )}
                  {...getItemProps({
                    ref(node) {
                      listRef.current[items.length] = node
                    },
                    onClick: () => {
                      toggleItem(input.trim())
                      setInput('')
                    }
                  })}
                >
                  {`새 ${name} 생성: ${input}`}
                </div>
              )}
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </>
  )
}
