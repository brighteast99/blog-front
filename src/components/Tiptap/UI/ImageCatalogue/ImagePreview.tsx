import { useEffect, useState } from 'react'
import clsx from 'clsx'

import { mdiClose } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'

import type { FC } from 'react'

export const ImagePreview: FC<{
  isThumbnail?: boolean
  image: File | string
  onDelete?: (image: string) => any
  onSelect?: (image: string) => any
  onChangeThumbnail?: (image: string | null) => any
}> = ({
  isThumbnail = false,
  image,
  onDelete,
  onSelect,
  onChangeThumbnail
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
      className={clsx(
        'relative aspect-square border',
        isThumbnail ? 'border-2 border-primary' : 'border-neutral-400'
      )}
    >
      {isThumbnail && (
        <div className='absolute size-fit bg-primary px-1 py-0.5 text-background'>
          대표
        </div>
      )}
      {image instanceof File ? (
        <div className='absolute size-full bg-neutral-50 bg-opacity-50'>
          <Spinner className='absolute inset-0' />
        </div>
      ) : (
        <div className='absolute size-full bg-neutral-50 bg-opacity-75 opacity-0 transition-opacity hover:opacity-100'>
          <IconButton
            className='absolute right-0 top-0'
            path={mdiClose}
            variant='hover-text'
            color='error'
            onClick={() => {
              if (
                !window.confirm(
                  `${isThumbnail ? '대표 이미지가 해제되며 ' : ''}본문에 포함된 이미지도 모두 제거됩니다.`
                )
              )
                return
              onDelete?.(image)
            }}
          />
          <div className='absolute inset-0 m-auto flex size-fit flex-col items-center justify-center gap-2'>
            <ThemedButton
              className='p-1'
              color='primary'
              onClick={() => onSelect?.(image)}
            >
              본문에 삽입
            </ThemedButton>
            <ThemedButton
              className='p-1'
              color={isThumbnail ? 'error' : 'primary'}
              variant={isThumbnail ? 'text' : 'flat'}
              onClick={() => onChangeThumbnail?.(isThumbnail ? null : image)}
            >
              {isThumbnail ? '대표 이미지 해제' : '대표 이미지 설정'}
            </ThemedButton>
          </div>
        </div>
      )}
      <img className='block size-full object-contain' src={src} alt='' />
    </div>
  )
}
