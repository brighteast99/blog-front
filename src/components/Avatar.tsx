import { cva } from 'class-variance-authority'

import { cn } from 'utils/handleClassName'

import type { FC, HTMLAttributes } from 'react'
import type { sizeLiteral } from 'types/commonProps'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the avatar
   */
  size?: sizeLiteral
  /**
   * Source of the avatar image
   */
  src?: string
}

export const AvatarVariants = cva('aspect-square overflow-clip rounded-full', {
  variants: {
    size: {
      xs: 'size-12',
      sm: 'size-16',
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

const DEFAULT_IMAGE =
  'https://kr.cafe24obs.com/blog.brighteast/staticfiles/default-profile.png'

export const Avatar: FC<AvatarProps> = ({
  className = '',
  size = 'md',
  src,
  ...props
}) => {
  return (
    <div className={cn(AvatarVariants({ size }), className)} {...props}>
      <img
        src={src || DEFAULT_IMAGE}
        alt='Profile'
        className='block size-full object-cover object-center'
        onError={(e) => {
          e.currentTarget.src = DEFAULT_IMAGE
        }}
      />
    </div>
  )
}
