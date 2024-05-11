import { FC, HTMLAttributes } from 'react'
import { cn } from '../utils/handleClassName'
import { PositiveInteger } from 'types/commonTypes'
import { alignLiteral } from 'types/commonProps'
import { cva } from 'class-variance-authority'

export interface SuspendedTextProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the spinner
   */
  text?: string
  length?: number
  loading?: boolean
  lines?: PositiveInteger<number>
  align?: alignLiteral
}

export const SuspendedTextVariants = cva(
  `inline-flex max-w-full flex-col gap-2`,
  {
    variants: {
      align: {
        left: 'text-left items-left',
        center: 'text-center items-center',
        right: 'text-left items-right',
        start: 'text-start items-start',
        end: 'text-end items-end'
      }
    },
    defaultVariants: {
      align: 'start'
    }
  }
)

export const SuspendedText: FC<SuspendedTextProps> = ({
  className = '',
  text,
  loading,
  length = 1,
  lines = 1,
  align = 'start',
  ...props
}) => {
  if (loading)
    return (
      <div className={cn(className, SuspendedTextVariants({ align }))}>
        {Array.from({ length: lines }, (_val, i) => (
          <span
            key={i}
            className='pointer-none w-fit min-w-0 max-w-full animate-pulse cursor-wait rounded-full bg-neutral-800 text-transparent opacity-25'
            {...props}
          >
            {'◼︎'.repeat(lines === 1 || i < lines - 1 ? length : length / 5)}
          </span>
        ))}
      </div>
    )
  return (
    <span
      className={cn(className, SuspendedTextVariants({ align }))}
      style={{
        ...props?.style,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: lines
      }}
      {...props}
    >
      {text}
    </span>
  )
}
