import { useLayoutEffect, useState } from 'react'
import clsx from 'clsx'

import { useQuery } from '@apollo/client'
import { GET_IMAGES } from './api'

import { useToggle } from 'hooks/useToggle'
import { cn } from 'utils/handleClassName'

import { mdiClose, mdiImageSearch } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Error } from 'components/Error'
import { Spinner } from 'components/Spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

import type { FC } from 'react'

interface ImageImporterProps {
  className?: string
  exclude?: string[]
  description?: string
  onClickImport?: (images: string[]) => any
}

export const ImageImporter: FC<ImageImporterProps> = ({
  className,
  exclude,
  description,
  onClickImport
}) => {
  const { value: isOpen, setFalse: close, toggle } = useToggle(false)
  const { data, loading, error, refetch } = useQuery(GET_IMAGES, {
    notifyOnNetworkStatusChange: true,
    skip: !isOpen
  })
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  useLayoutEffect(() => {
    if (isOpen) refetch()
  }, [isOpen, refetch])

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton
            className={cn(className)}
            path={mdiImageSearch}
            variant='hover-text-toggle'
            active={isOpen}
            onClick={toggle}
          />
        </TooltipTrigger>
        {description && <TooltipContent>{description}</TooltipContent>}
      </Tooltip>

      {isOpen && (
        <div className='absolute inset-0 z-20 flex size-full items-center justify-center bg-neutral-50 bg-opacity-80'>
          <div className='relative flex h-4/5 w-4/5 flex-col gap-4 rounded border border-neutral-100 bg-background shadow-lg'>
            <div className='flex justify-between px-4 pt-4'>
              <span className='text-xl font-semibold'>업로드된 이미지</span>
              <IconButton
                path={mdiClose}
                variant='hover-text'
                color='error'
                onClick={close}
              />
            </div>
            {loading && <Spinner className='absolute inset-0' />}
            {error && (
              <Error
                message='이미지 목록을 불러오지 못했습니다'
                hideDefaultAction
                actions={[{ label: '다시 시도', handler: () => refetch() }]}
              />
            )}
            {data && (
              <div
                className='relative grid min-h-0 grow gap-3 px-4'
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 150px))'
                }}
              >
                {data.images.length === 0 && (
                  <span className='absolute inset-0 m-auto size-fit text-xl text-foreground text-opacity-25'>
                    업로드된 이미지가 없습니다
                  </span>
                )}
                {data.images.map((image) => {
                  const selected = selectedImages.includes(image)
                  const excluded = exclude?.includes(image)
                  return (
                    <div
                      key={image}
                      className={clsx(
                        'relative aspect-square cursor-pointer outline',
                        excluded
                          ? 'cursor-not-allowed outline-neutral-200'
                          : 'cursor-pointer',
                        selected
                          ? 'outline-2 outline-primary'
                          : 'outline-neutral-400'
                      )}
                      onClick={() => {
                        if (excluded) return
                        if (selected)
                          setSelectedImages((prev) =>
                            prev.toSpliced(
                              prev.findIndex((_image) => _image === image),
                              1
                            )
                          )
                        else setSelectedImages((prev) => [...prev, image])
                      }}
                    >
                      {excluded && (
                        <>
                          <div className='absolute size-full bg-neutral-50 opacity-80' />
                          <span className='absolute inset-0 m-auto size-fit text-lg font-semibold text-foreground text-opacity-75'>
                            사용중
                          </span>
                        </>
                      )}
                      <img
                        className='block size-full object-contain'
                        src={image}
                        alt=''
                      />
                    </div>
                  )
                })}
              </div>
            )}
            <ThemedButton
              className='rounded-t-none py-2'
              color='primary'
              disabled={selectedImages.length === 0}
              onClick={() => {
                onClickImport?.(selectedImages)
                close()
              }}
            >
              {selectedImages.length === 0 ? '선택된 이미지 없음' : '사용'}
            </ThemedButton>
          </div>
        </div>
      )}
    </>
  )
}
