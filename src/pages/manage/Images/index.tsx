import { Suspense, useLayoutEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ErrorBoundary } from 'react-error-boundary'

import { useLoadableQuery, useQuery } from '@apollo/client'
import { GET_IMAGE, GET_IMAGES } from './api'

import { useAppSelector } from 'store/hooks'
import { selectIsMobile } from 'store/slices/window/windowSlice'

import Icon from '@mdi/react'
import { mdiAlertCircle } from '@mdi/js'
import { ImageInfo } from 'pages/manage/Images/ImageInfo'
import { Error } from 'components/Error'
import { ImagePreview } from 'components/ImagePreview'
import { Spinner } from 'components/Spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

import type { FC } from 'react'
import type { fileSizeUnitLiteral } from 'types/commonProps'

const IMAGE_SIZE_UNIT: fileSizeUnitLiteral = 'MB'

export const ManageImagePage: FC = () => {
  const isMobile = useAppSelector(selectIsMobile)

  const { data, loading, error, refetch } = useQuery(GET_IMAGES, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true
  })
  const [deleting, setDeleting] = useState<boolean>()
  const [selectedImage, setSelectedImage] = useState<string>()
  const [
    loadImageInfo,
    queryRef,
    { refetch: refetchImage, reset: resetImage }
  ] = useLoadableQuery(GET_IMAGE, { fetchPolicy: 'cache-and-network' })

  const images = useMemo(() => data?.images ?? null, [data?.images])
  const [deletedImages, setDeletedImages] = useState<string[]>([])

  useLayoutEffect(() => {
    if (selectedImage)
      loadImageInfo({ url: selectedImage, unit: IMAGE_SIZE_UNIT })
    else resetImage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage])

  return (
    <div
      className={clsx(
        'flex items-center justify-center gap-2 p-5',
        isMobile && 'flex-col-reverse'
      )}
    >
      <div
        className={clsx(
          'relative flex-1 overflow-y-auto rounded border border-neutral-200 bg-neutral-50 p-4',
          isMobile ? 'w-full grow' : 'h-full grow-[0.75]'
        )}
      >
        {(loading || deleting) && (
          <div
            className={clsx(
              'absolute inset-0 z-10 size-full bg-neutral-50',
              data && loading
                ? 'pointer-events-none bg-opacity-0'
                : 'bg-opacity-50'
            )}
          >
            <Spinner className='absolute inset-0' />
          </div>
        )}
        {error && (
          <Error
            code={500}
            hideDefaultAction
            actions={[{ label: '다시 시도', handler: refetch }]}
          />
        )}
        {images && (
          <div
            className='grid gap-3'
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
              gridTemplateRows: 'auto'
            }}
          >
            {images?.length === 0 && (
              <span className='absolute inset-0 m-auto size-fit text-xl text-foreground text-opacity-25'>
                업로드된 이미지가 없습니다
              </span>
            )}
            {images.map(({ id, url, isReferenced }) =>
              deletedImages.includes(url) ? null : (
                <ImagePreview
                  image={url}
                  key={id}
                  active={selectedImage === url}
                  onClick={setSelectedImage}
                >
                  {!isReferenced && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Icon
                          className='absolute bottom-1.5 left-1.5 text-warning'
                          path={mdiAlertCircle}
                          size={0.8}
                        />
                      </TooltipTrigger>
                      <TooltipContent>사용되지 않는 이미지</TooltipContent>
                    </Tooltip>
                  )}
                </ImagePreview>
              )
            )}
          </div>
        )}
      </div>

      <div
        className={clsx(
          'relative flex flex-col items-center justify-center rounded border border-neutral-200 bg-neutral-50 px-4 pb-4 pt-6',
          isMobile
            ? 'min-h-40 w-max min-w-100 max-w-[800px]'
            : 'h-fit min-h-[32rem] flex-1 grow-[0.25]'
        )}
      >
        <ErrorBoundary
          FallbackComponent={({ resetErrorBoundary }) => (
            <Error
              message='이미지 정보를 불러오지 못했습니다'
              hideDefaultAction
              actions={[
                {
                  label: '다시 시도',
                  handler: () => {
                    refetchImage()
                    resetErrorBoundary()
                  }
                }
              ]}
            />
          )}
        >
          <Suspense fallback={<Spinner className='absolute inset-0' />}>
            {queryRef ? (
              <ImageInfo
                queryRef={queryRef}
                sizeUnit={IMAGE_SIZE_UNIT}
                onDelete={(promise) => {
                  setDeleting(true)
                  promise.then(() => {
                    setDeleting(false)
                    setDeletedImages((prev) => [
                      ...prev,
                      selectedImage as string
                    ])
                    setSelectedImage(undefined)
                  })
                }}
              />
            ) : (
              <span className='absolute inset-0 m-auto block size-fit text-nowrap text-xl text-neutral-400'>
                이미지를 선택하세요
              </span>
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
