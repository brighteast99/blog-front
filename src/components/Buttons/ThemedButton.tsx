import { forwardRef, useMemo } from 'react'
import clsx from 'clsx'

import { cn } from 'utils/handleClassName'

import { Spinner } from 'components/Spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react'
import type { TooltipOptions } from 'components/utils/Tooltip'
import type { NamedColors, sizeLiteral } from 'types/commonProps'

export type ButtonVariant =
  | 'flat'
  | 'hover-text'
  | 'hover-text-toggle'
  | 'text'
  | 'text-toggle'
  | 'outline'
  | 'outline-toggle'

interface ThemedButtonProps {
  type?: 'submit' | 'button'
  color: NamedColors
  variant?: ButtonVariant
  active?: boolean
  loading?: boolean
  spinnerSize?: sizeLiteral
  tooltip?: string
  tooltipOptions?: TooltipOptions
  disabled?: boolean
  children?: ReactNode
}

export const ThemedButton = forwardRef<
  HTMLButtonElement,
  ThemedButtonProps &
    DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>(
  (
    {
      className,
      color = 'primary',
      variant = 'flat',
      active = false,
      disabled = false,
      loading = false,
      spinnerSize,
      tooltip,
      tooltipOptions,
      children,
      ...props
    },
    ref
  ) => {
    const colorClassName = useMemo(() => {
      switch (color) {
        case 'primary':
          return 'text-primary bg-primary border-primary border'

        case 'secondary':
          return 'text-secondary bg-secondary border-secondary border'

        case 'info':
          return 'text-info bg-info border-info border'

        case 'success':
          return 'text-success bg-success border-success border'

        case 'warning':
          return 'text-warning bg-warning border-warning border'

        case 'error':
          return 'text-error bg-error border-error border'

        default:
          return variant === 'flat'
            ? 'text-background bg-foreground'
            : 'text-foreground bg-background'
      }
    }, [color, variant])

    const variantClassName = useMemo(() => {
      switch (variant) {
        case 'flat':
          return clsx(
            'border-none',
            color && 'text-neutral-50',
            disabled
              ? 'opacity-50'
              : 'hover:brightness-110 active:brightness-90'
          )
        case 'hover-text':
          return clsx(
            'bg-opacity-0 border-none',
            disabled
              ? 'text-inherit opacity-25'
              : '[&:not(:hover)]:text-inherit [&:not(:hover)]:opacity-70'
          )
        case 'hover-text-toggle':
          return clsx(
            'bg-opacity-0 border-none',
            disabled
              ? 'text-inherit opacity-25'
              : active
                ? 'bg-opacity-20 hover:bg-opacity-10'
                : '[&:not(:hover)]:text-inherit [&:not(:hover)]:opacity-70'
          )
        case 'text':
          return clsx(
            'bg-opacity-0 border-none',
            disabled ? 'text-opacity-50' : 'hover:bg-opacity-20'
          )
        case 'text-toggle':
          return clsx(
            'bg-opacity-0 border-none',
            disabled
              ? 'text-opacity-50'
              : 'hover:bg-opacity-20 [&:not(:hover)]:data-[active="true"]:bg-opacity-10'
          )
        case 'outline':
          return clsx(
            'bg-opacity-0',
            disabled ? 'opacity-50' : 'hover:bg-opacity-20'
          )
        case 'outline-toggle':
          return clsx(
            'bg-opacity-0',
            disabled
              ? 'opacity-50'
              : 'hover:bg-opacity-20 [&:not(:hover)]:data-[active="true"]:bg-opacity-10'
          )
        default:
          return ''
      }
    }, [active, color, disabled, variant])

    const button = (
      <button
        ref={ref}
        className={cn(
          'rounded transition-colors',
          colorClassName,
          variantClassName,
          className
        )}
        disabled={loading || disabled}
        data-active={active}
        {...props}
      >
        {loading ? <Spinner size={spinnerSize} /> : children}
      </button>
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
