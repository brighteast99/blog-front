import { cva } from 'class-variance-authority'
import clsx from 'clsx'

import { cn } from 'utils/handleClassName'

import Icon from '@mdi/react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

import type { FC, HTMLAttributes, MouseEvent } from 'react'
import type { Placement } from '@floating-ui/react'
import type { NamedColors, sizeLiteral } from 'types/commonProps'

export type IconPosition = 'Left' | 'Right'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  size?: Exclude<sizeLiteral, '2xl'>
  color?: Exclude<NamedColors, 'unset'>
  icon?: string
  iconPosition?: IconPosition
  interactive?: boolean
  tooltip?: string
  tooltipPlacement?: Placement
  onClick?: (e: MouseEvent<HTMLSpanElement>) => any
}

export const SpinnerVariants = cva(
  'inline-flex size-fit items-center justify-center border bg-opacity-25 py-0.5 text-foreground',
  {
    variants: {
      color: {
        primary: 'bg-primary border-primary',
        secondary: 'bg-secondary border-secondary',
        info: 'bg-info border-info',
        success: 'bg-success border-success',
        warning: 'bg-warning border-warning',
        error: 'bg-error border-error'
      },
      size: {
        xs: 'text-xs rounded-md min-w-4 px-1.5 gap-0.5',
        sm: 'text-sm rounded-lg min-w-4 px-1.5 gap-0.5',
        md: 'text-base rounded-xl min-w-6 px-2 gap-1',
        lg: 'text-lg rounded-2xl min-w-8 px-2 gap-1',
        xl: 'text-xl rounded-2xl min-w-8 px-2 gap-1'
      },
      interactive: {
        true: 'hover:brightness-110 active:brightness-90 cursor-pointer',
        false: ''
      }
    },
    defaultVariants: {
      color: 'primary',
      size: 'md',
      interactive: false
    }
  }
)

export const Badge: FC<BadgeProps> = ({
  className = '',
  color,
  size,
  interactive,
  icon,
  iconPosition = 'Left',
  tooltip,
  tooltipPlacement = 'top',
  onClick,
  ...props
}) => {
  return (
    <Tooltip open={tooltip ? undefined : false} placement={tooltipPlacement}>
      <TooltipTrigger>
        <span
          className={cn(
            SpinnerVariants({ size, color, interactive }),
            className
          )}
          {...props}
          onClick={interactive ? onClick : undefined}
        >
          {icon && (
            <Icon
              className={clsx(iconPosition == 'Right' && 'order-1')}
              path={icon}
              size='1em'
            />
          )}
          {props?.children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
