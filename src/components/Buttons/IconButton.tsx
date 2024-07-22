import { HTMLProps, forwardRef } from 'react'

import Icon from '@mdi/react'
import { IconProps } from '@mdi/react/dist/IconProps'
import clsx from 'clsx'

import { ThemedButton } from 'components/Buttons/ThemedButton'

import { NamedColors } from 'types/commonProps'

export interface IconButtonProps {
  type?: 'submit' | 'button'
  color?: NamedColors
  variant: 'hover-text' | 'hover-text-toggle' | 'text' | 'text-toggle'
  active?: boolean
  path: string
  size?: string | number
  rotate?: number
  iconProps?: IconProps
}

export const IconButton = forwardRef<
  HTMLButtonElement,
  IconButtonProps & Omit<HTMLProps<HTMLButtonElement>, 'size'>
>(
  (
    {
      className,
      color = 'primary',
      variant = 'hover-text',
      active,
      path,
      size = 1,
      rotate = 0,
      iconProps,
      ...props
    },
    ref
  ) => {
    return (
      <ThemedButton
        className={clsx('min-w-fit p-1', className)}
        ref={ref}
        color={color}
        variant={variant}
        active={active}
        {...props}
      >
        <Icon
          className={clsx('mx-auto', iconProps?.className)}
          path={path}
          size={size}
          rotate={rotate}
          {...iconProps}
        />
      </ThemedButton>
    )
  }
)
