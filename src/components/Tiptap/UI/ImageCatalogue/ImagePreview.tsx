import { useEffect, useState } from 'react'

import { cn } from 'utils/handleClassName'

import { Spinner } from 'components/Spinner'

import type { FC, ReactNode } from 'react'

interface ImagePreviewProps {
  className?: string
  active?: boolean
  image: File | string
  loading?: boolean
  disabled?: boolean
  useHoverMenu?: boolean
  label?: ReactNode
  children?: ReactNode
  onClick?: (image: File | string) => any
}

export const ImagePreview: FC<ImagePreviewProps> = ({
  className,
  image,
  active = false,
  disabled,
  loading,
  useHoverMenu,
  label,
  children,
  onClick
}) => {
  let [src, setSrc] = useState<string>()

  useEffect(() => {
    if (typeof image === 'string') {
      setSrc(image)
      return
    }

    const url = URL.createObjectURL(image)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  return (
    <div
      className={cn(
        'relative aspect-square outline transition-colors',
        active ? 'outline-2 outline-primary' : 'outline-1 outline-neutral-400',
        disabled ? 'outline-1 outline-neutral-100' : 'cursor-pointer',
        className
      )}
      onClick={() => {
        if (disabled) return
        onClick?.(image)
      }}
    >
      {loading && (
        <div className='absolute size-full bg-neutral-50 bg-opacity-50'>
          <Spinner className='absolute inset-0' />
        </div>
      )}
      {useHoverMenu && !disabled && (
        <div className='absolute size-full bg-neutral-50 bg-opacity-75 opacity-0 transition-opacity hover:opacity-100'>
          {children}
        </div>
      )}
      {label}
      <img className='block size-full object-contain' src={src} alt='' />
    </div>
  )
}
