import {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
  forwardRef,
  useMemo
} from 'react'
import clsx from 'clsx'
import { cn } from 'utils/handleClassName'
import { NamedColors } from 'types/commonProps'

export interface ThemedButtonProps {
  type?: 'submit' | 'button'
  color: NamedColors
  variant?:
    | 'flat'
    | 'hover-text'
    | 'hover-text-toggle'
    | 'text'
    | 'text-toggle'
    | 'outline'
    | 'outline-toggle'
  active?: boolean
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

    return (
      <button
        ref={ref}
        className={cn(
          'rounded transition-colors',
          colorClassName,
          variantClassName,
          className
        )}
        disabled={disabled}
        data-active={active}
        {...props}
      >
        {children}
      </button>
    )
  }
)
