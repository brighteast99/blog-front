import { useRef, useState } from 'react'

import { cn } from 'utils/handleClassName'

import { useImageViewer } from 'components/ImageViewer'
import { Spinner } from 'components/Spinner'

import type { FC, ReactNode } from 'react'

interface ImagePreviewProps {
  image?: string
  className?: string
  active?: boolean
  loading?: boolean
  disabled?: boolean
  magnifyOnHover?: boolean
  openViewerOnClick?: boolean
  children?: ReactNode
  onClick?: (image: string) => any
}

export const ImagePreview: FC<ImagePreviewProps> = ({
  image,
  className,
  active,
  loading: _loading,
  disabled,
  magnifyOnHover,
  openViewerOnClick,
  onClick,
  children
}) => {
  const areaRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [loading, setIsLoading] = useState<boolean>(true)
  const { Viewer, open } = useImageViewer(image)
  const [hover, setHover] = useState<boolean>(false)
  const scale = (() => {
    if (!magnifyOnHover || !areaRef.current || !imageRef.current) return 1

    if (areaRef.current.clientWidth > imageRef.current.clientWidth)
      return areaRef.current.clientWidth / imageRef.current.clientWidth
    else if (areaRef.current.clientHeight > imageRef.current.clientHeight)
      return areaRef.current.clientHeight / imageRef.current.clientHeight
  })()

  return (
    <>
      {openViewerOnClick && <Viewer />}
      <div
        ref={areaRef}
        className={cn(
          'relative aspect-square overflow-hidden outline transition-colors',
          active
            ? 'outline-2 outline-primary'
            : 'outline-1 outline-neutral-400',
          disabled ? 'outline-1 outline-neutral-100' : 'cursor-pointer',
          className
        )}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => {
          if (disabled || !image) return
          onClick?.(image)
          if (openViewerOnClick) open()
        }}
      >
        <img
          ref={imageRef}
          className='absolute inset-0 m-auto block max-h-full max-w-full object-contain transition-transform'
          src={image}
          alt=''
          style={{
            transform:
              !disabled && magnifyOnHover
                ? `scale(${hover ? scale : 1})`
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
    </>
  )
}
