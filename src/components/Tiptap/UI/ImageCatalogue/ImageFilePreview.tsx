import { useEffect, useState } from 'react'

import { ImagePreview } from 'components/ImagePreview'

import type { FC, ReactNode } from 'react'

interface ImagePreviewProps {
  className?: string
  image: File
  loading?: boolean
  children?: ReactNode
}

export const ImageFilePreview: FC<ImagePreviewProps> = ({
  className,
  image,
  loading,
  children
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
    <ImagePreview
      image={src}
      className={className}
      loading={loading}
      children={children}
    />
  )
}
