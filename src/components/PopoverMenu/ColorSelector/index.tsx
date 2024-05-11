import {
  ChangeEvent,
  DetailedHTMLProps,
  FC,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  StyleHTMLAttributes,
  useCallback,
  useState
} from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import Palette from './palette'

import Icon from '@mdi/react'
import { mdiWaterOff } from '@mdi/js'
import { PopoverMenu } from 'components/PopoverMenu'
import { ThemedButton } from 'components/Buttons/ThemedButton'

import styles from './ColorSelector.module.scss'
import { Placement } from '@floating-ui/react'

const ColorPreview: FC<
  DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    active: boolean
  }
> = ({ color, active, ...props }) => {
  return (
    <button
      {...props}
      className={clsx(
        styles['color-preview'],
        active ? 'ring ring-primary' : 'hover:border-2 hover:border-primary'
      )}
      data-color={color}
      style={{ backgroundColor: color }}
    />
  )
}

export interface ColorSelectorProps {
  className?: string
  description?: string
  value: string
  placement?: Placement
  tooltipPlacement?: Placement
  style?: StyleHTMLAttributes<HTMLDivElement>
  children?: ReactNode
  onChange: (color: string | null) => any
}

export const ColorSelector: FC<ColorSelectorProps> = ({
  className,
  description,
  value,
  placement = 'bottom-start',
  tooltipPlacement = 'top',
  style,
  children,
  onChange
}) => {
  const [customColor, setCustomColor] = useState({
    input: '',
    color: '#000000'
  })

  const selectColor = useCallback(
    (e: MouseEvent<any>) => {
      let color = e.currentTarget.dataset.color

      if (!color) return

      if (typeof onChange === 'function')
        onChange(color === 'unset' ? null : color)
    },
    [onChange]
  )

  const filterInput = (e: KeyboardEvent<HTMLInputElement>) => {
    const validKeys = /^[0-9a-fA-F]$/

    if (
      (!validKeys.test(e.key) &&
        e.key.length === 1 &&
        !(e.metaKey || e.ctrlKey)) ||
      e.nativeEvent.isComposing
    )
      e.preventDefault()
  }

  const validateColor = (e: ChangeEvent<HTMLInputElement>) => {
    const validFormat = /^[0-9a-fA-F]{0,6}$/

    let value = e.target.value
    if (value.startsWith('#')) value = value.substring(1)
    value = value.substring(0, 6)

    setCustomColor((prevState) => {
      return {
        input: validFormat.test(value) ? value : prevState.input,
        color: value.length === 6 ? '#' + value : '#000000'
      }
    })
  }

  return (
    <PopoverMenu
      className={className}
      placement={placement}
      tooltipPlacement={tooltipPlacement}
      description={description}
      menuBtn={
        children || (
          <div
            className='h-4 w-4 rounded border border-neutral-300'
            style={{ ...style, backgroundColor: value }}
          />
        )
      }
    >
      <div className='w-[312px] px-2 py-1'>
        <span className='select-none text-sm text-neutral-600'>
          목록에서 선택
        </span>
        <ThemedButton
          className={clsx(
            'mb-2 mt-1.5 w-full p-2 text-left',
            !value && 'outline outline-primary'
          )}
          color='primary'
          variant={value ? 'hover-text' : 'text'}
          data-color='unset'
          onClick={selectColor}
        >
          <Icon className='-mt-0.5 mr-3 inline' path={mdiWaterOff} size={1} />
          없음
        </ThemedButton>

        <div className='mb-1.5 flex flex-col justify-between gap-1.5'>
          {Palette.map((colors, i) => (
            <div key={i} className='flex justify-between'>
              {colors.map((color) => (
                <ColorPreview
                  key={color}
                  color={color}
                  active={color === value}
                  onClick={selectColor}
                />
              ))}
            </div>
          ))}
        </div>

        <div>
          <span className='select-none text-sm text-neutral-600'>
            또는 직접 입력
          </span>

          <div className='flex gap-2'>
            <div className='flex grow items-center gap-1 border-b border-neutral-500 text-neutral-500 transition-colors focus-within:border-primary focus-within:text-primary'>
              <span className='select-none text-xl'>#</span>
              <input
                className='w-0 shrink grow border-none bg-transparent text-foreground focus:outline-none'
                value={customColor.input}
                placeholder='000000'
                onKeyDown={filterInput}
                onChange={validateColor}
              />
              <input
                className={twMerge(
                  styles['color-preview'],
                  'cursor-pointer border-inherit',
                  customColor.color === value &&
                    'outline outline-2 outline-primary'
                )}
                type='color'
                value={customColor.color}
                onChange={(e) => {
                  setCustomColor({
                    input: e.target.value.substring(1),
                    color: e.target.value
                  })
                }}
              />
            </div>
            <ThemedButton
              className='self-end px-2 py-1 disabled:text-opacity-50'
              color='primary'
              variant='text'
              disabled={customColor.input.length !== 6}
              data-color={customColor.color}
              onClick={selectColor}
            >
              적용
            </ThemedButton>
          </div>
        </div>
      </div>
    </PopoverMenu>
  )
}
