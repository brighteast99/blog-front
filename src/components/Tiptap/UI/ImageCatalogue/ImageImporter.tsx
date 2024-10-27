import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'

import { useQuery } from '@apollo/client'
import { GET_IMAGES } from 'api/media'

import { useToggle } from 'hooks/useToggle'
import { cn } from 'utils/handleClassName'

import { mdiClose, mdiImageSearch } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Error } from 'components/Error'
import { ImagePreview } from 'components/ImagePreview'
import { Spinner } from 'components/Spinner'

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
  const { value: hideExcluded, toggle: toggleHideExcluded } = useToggle(true)
  const images = useMemo(() => data?.images || null, [data?.images])
  const filteredImages = images
    ? images.filter((image) => !hideExcluded || !exclude?.includes(image.url))
    : null

  useEffect(() => {
    if (isOpen) refetch()
    else setSelectedImages([])
  }, [isOpen, refetch])

  return (
    <>
      <IconButton
        className={cn(className)}
        path={mdiImageSearch}
        variant='hover-text-toggle'
        active={isOpen}
        tooltip={description}
        onClick={toggle}
      />

      {isOpen && (
        <div className='absolute inset-0 z-20 flex size-full items-center justify-center bg-neutral-50 bg-opacity-80'>
          <div className='relative flex max-h-[80%] w-4/5 flex-col gap-4 rounded border border-neutral-100 bg-background shadow-lg'>
            <div className='flex items-center gap-4 px-4 pt-4'>
              <span className='text-xl font-semibold'>서버 이미지</span>
              <label className='self-end'>
                <input
                  type='checkbox'
                  className='accent-primary'
                  checked={hideExcluded}
                  onChange={toggleHideExcluded}
                />
                <span className='ml-1 text-sm text-neutral-700'>
                  게시글에 포함된 항목 제외
                </span>
              </label>
              <div className='min-w-0 grow' />
              <IconButton
                path={mdiClose}
                variant='hover-text'
                color='error'
                onClick={close}
              />
            </div>

            <div className='relative min-h-0 grow overflow-y-auto p-4'>
              {loading && <Spinner className='absolute inset-0 m-auto' />}
              {error && (
                <Error
                  message='이미지 목록을 불러오지 못했습니다'
                  hideDefaultAction
                  actions={[{ label: '다시 시도', handler: () => refetch() }]}
                />
              )}
              {filteredImages && (
                <div
                  className='grid size-full gap-3'
                  style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
                    gridTemplateRows: 'auto'
                  }}
                >
                  {filteredImages.length === 0 && (
                    <span className='absolute inset-0 m-auto size-fit text-xl text-foreground text-opacity-25'>
                      사용 가능한 이미지가 없습니다
                    </span>
                  )}
                  {filteredImages.map(({ url }) => {
                    const selected = selectedImages.includes(url)
                    const excluded = exclude?.includes(url)
                    return (
                      <ImagePreview
                        key={url}
                        className={clsx(
                          'relative',
                          excluded ? 'cursor-not-allowed' : 'cursor-pointer'
                        )}
                        image={url}
                        active={selected}
                        disabled={excluded}
                        onClick={() =>
                          setSelectedImages((prev) => {
                            if (prev.includes(url))
                              return prev.toSpliced(
                                prev.findIndex((_image) => _image === url),
                                1
                              )
                            return [...prev, url]
                          })
                        }
                      >
                        {excluded && (
                          <div className='absolute flex size-full items-center justify-center bg-neutral-50 opacity-75'>
                            <span className='text-lg font-semibold text-foreground text-opacity-75'>
                              사용중
                            </span>
                          </div>
                        )}
                      </ImagePreview>
                    )
                  })}
                </div>
              )}
            </div>
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
