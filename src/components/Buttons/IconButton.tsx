import { forwardRef } from 'react'
import clsx from 'clsx'

import Icon from '@mdi/react'
import { mdiLoading } from '@mdi/js'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

import type { HTMLProps } from 'react'
import type { IconProps } from '@mdi/react/dist/IconProps'
import type { TooltipOptions } from 'components/utils/Tooltip'
import type { NamedColors, sizeLiteral } from 'types/commonProps'

interface IconButtonProps {
  type?: 'submit' | 'button'
  color?: NamedColors
  variant: 'hover-text' | 'hover-text-toggle' | 'text' | 'text-toggle'
  active?: boolean
  path: string
  size?: string | number
  rotate?: number
  iconProps?: Omit<IconProps, 'path'>
  disabled?: boolean
  loading?: boolean
  spinnerSize?: sizeLiteral
  tooltip?: string
  tooltipOptions?: TooltipOptions
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
      disabled,
      loading,
      spinnerSize,
      tooltip,
      tooltipOptions,
      ...props
    },
    ref
  ) => {
    const button = (
      <ThemedButton
        className={clsx('min-w-fit p-1', className)}
        ref={ref}
        color={color}
        variant={variant}
        disabled={loading || disabled}
        active={active}
        {...props}
      >
        <Icon
          className={clsx('mx-auto', iconProps?.className)}
          path={loading ? mdiLoading : path}
          size={loading ? (spinnerSize ?? size) : size}
          rotate={rotate}
          {...iconProps}
        />
      </ThemedButton>
    )

    if (!tooltip) return button

    return (
      <Tooltip {...tooltipOptions}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    )
  }
)
