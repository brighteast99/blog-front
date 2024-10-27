import { useRef, useState } from 'react'

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
  scaleOnHover?: boolean
  onClick?: (image: string) => any
}

export const ImagePreview: FC<ImagePreviewProps> = ({
  image,
  className,
  active,
  loading: _loading,
  disabled,
  scaleOnHover,
  children,
  onClick
}) => {
  const [loading, setIsLoading] = useState<boolean>(true)
  const areaRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [hover, setHover] = useState<boolean>(false)

  return (
    <div
      ref={areaRef}
      className={cn(
        'relative aspect-square overflow-hidden outline transition-colors',
        active ? 'outline-2 outline-primary' : 'outline-1 outline-neutral-400',
        disabled ? 'outline-1 outline-neutral-100' : 'cursor-pointer',
        className
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        if (disabled || !image) return
        onClick?.(image)
      }}
    >
      <img
        ref={imageRef}
        className='absolute inset-0 m-auto block h-full object-contain transition-transform'
        src={image}
        alt=''
        style={{
          transform:
            !disabled && scaleOnHover
              ? `scale(${hover ? (areaRef.current?.clientWidth ?? 1) / (imageRef.current?.clientWidth ?? 1) : 1})`
              : undefined
        }}
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
