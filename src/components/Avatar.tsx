import { FC, HTMLAttributes } from 'react'
import { sizeLiteral } from '../types/commonProps'
import { cva } from 'class-variance-authority'
import { cn } from '../utils/handleClassName'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the avatar
   */
  size?: sizeLiteral
  /**
   * Source of the avatar image
   */
  imgSrc?: string
}

export const AvatarVariants = cva(`aspect-square overflow-clip rounded-full`, {
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

export const Avatar: FC<AvatarProps> = ({
  className = '',
  size = 'md',
  imgSrc = 'https://kr.cafe24obs.com/blog.brighteast/staticfiles/default-profile.png',
  ...props
}) => {
  return (
    <div className={cn(AvatarVariants({ size }), className)} {...props}>
      <img
        src={imgSrc}
        alt='Profile'
        className='block size-full object-cover object-center'
      />
    </div>
  )
}
