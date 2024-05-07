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

const DEFAULT_IMAGE =
  'https://kr.cafe24obs.com/blog.brighteast/staticfiles/default-profile.png'

export const Avatar: FC<AvatarProps> = ({
  className = '',
  size = 'md',
  imgSrc,
  ...props
}) => {
  return (
    <div className={cn(AvatarVariants({ size }), className)} {...props}>
      <img
        src={imgSrc || DEFAULT_IMAGE}
        alt='Profile'
        className='block size-full object-cover object-center'
        onError={(e) => {
          e.currentTarget.src = DEFAULT_IMAGE
        }}
      />
    </div>
  )
}
