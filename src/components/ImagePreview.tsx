import { useState } from 'react'

import { cn } from 'utils/handleClassName'

import { Spinner } from 'components/Spinner'

import type { FC, ReactNode } from 'react'

interface ImagePreviewProps {
  image?: string
  className?: string
  active?: boolean
  loading?: boolean
  disabled?: boolean
  children?: ReactNode
  onClick?: (image: string) => any
}

export const ImagePreview: FC<ImagePreviewProps> = ({
  image,
  className,
  active = false,
  loading: _loading = false,
  disabled,
  children,
  onClick
}) => {
  const [loading, setIsLoading] = useState<boolean>(true)

  return (
    <div
      className={cn(
        'relative aspect-square outline transition-colors',
        active ? 'outline-2 outline-primary' : 'outline-1 outline-neutral-400',
        disabled ? 'outline-1 outline-neutral-100' : 'cursor-pointer',
        className
      )}
      onClick={() => {
        if (disabled || !image) return
        onClick?.(image)
      }}
    >
      <img
        className='absolute block size-full object-contain'
        src={image}
        alt=''
        onLoad={() => setIsLoading(false)}
      />
      {(loading || _loading) && (
        <div className='absolute size-full bg-neutral-50 bg-opacity-50'>
          <Spinner className='absolute inset-0' />
        </div>
      )}
      {children}
    </div>
  )
}
