import { FC, HTMLAttributes } from 'react'

import { mdiLoading } from '@mdi/js'
import Icon from '@mdi/react'
import { cva } from 'class-variance-authority'

import { cn } from '../utils/handleClassName'

import { sizeLiteral } from '../types/commonProps'

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the spinner
   */
  size?: sizeLiteral
}

export const SpinnerVariants = cva(`aspect-square m-auto`, {
  variants: {
    size: {
      xs: 'size-8',
      sm: 'size-12',
      md: 'size-20',
      lg: 'size-24',
      xl: 'size-32',
      '2xl': 'size-40'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

export const Spinner: FC<SpinnerProps> = ({
  className = '',
  size = 'md',
  ...props
}) => {
  return (
    <div className={cn(SpinnerVariants({ size }), className)} {...props}>
      <Icon path={mdiLoading} spin />
    </div>
  )
}
