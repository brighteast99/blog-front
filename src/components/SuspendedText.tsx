import { FC, HTMLAttributes } from 'react'
import { cn } from '../utils/handleClassName'
import { PositiveInteger } from 'types/commonTypes'

export interface SuspendedTextProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the spinner
   */
  text?: string
  length?: number
  loading?: boolean
  lines?: PositiveInteger<number>
}

export const SuspendedText: FC<SuspendedTextProps> = ({
  className = '',
  text,
  loading,
  length = 1,
  lines = 1,
  ...props
}) => {
  if (loading)
    return (
      <div className={cn(className, 'inline-flex max-w-full flex-col gap-2')}>
        {Array.from({ length: lines }, (_val, i) => (
          <span
            key={i}
            className='w-fit min-w-0 max-w-full animate-pulse rounded-full bg-neutral-800 text-transparent opacity-25'
            {...props}
          >
            {'◼︎'.repeat(lines === 1 || i < lines - 1 ? length : length / 5)}
          </span>
        ))}
      </div>
    )
  return (
    <span className={className} {...props}>
      {text}
    </span>
  )
}
