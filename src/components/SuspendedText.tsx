import { cva } from 'class-variance-authority'

import { cn } from 'utils/handleClassName'

import type { FC, HTMLAttributes } from 'react'
import type { alignLiteral } from 'types/commonProps'
import type { PositiveInteger } from 'types/commonTypes'

interface SuspendedTextProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the spinner
   */
  text?: string
  length?: number
  loading?: boolean
  lines?: PositiveInteger
  align?: alignLiteral
}

export const SuspendedTextVariants = cva(
  `inline-flex max-w-full min-w-0 flex-col gap-2 break-keep`,
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
            className='pointer-none w-fit min-w-0 max-w-full animate-pulse cursor-wait overflow-hidden rounded-full bg-neutral-800 text-transparent opacity-25'
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
      style={props?.style}
      {...props}
    >
      {text}
    </span>
  )
}
