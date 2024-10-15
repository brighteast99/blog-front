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

export const AvatarVariants = cva('aspect-square overflow-clip', {
  variants: {
    size: {
      xs: 'size-12 rounded-[0.9rem]',
      sm: 'size-16 rounded-[1.2rem]',
      md: 'size-20 rounded-[1.5rem]',
      lg: 'size-24 rounded-[1.8rem]',
      xl: 'size-32 rounded-[2.4rem]',
      '2xl': 'size-40 rounded-[3rem]'
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
  children,
  ...props
}) => {
  return (
    <div className={cn(AvatarVariants({ size }), className)} {...props}>
      {children}
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
