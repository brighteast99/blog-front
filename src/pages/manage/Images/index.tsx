import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ErrorBoundary } from 'react-error-boundary'

import { useLoadableQuery, useMutation, useQuery } from '@apollo/client'
import {
  DELETE_IMAGE,
  DELETE_IMAGES,
  GET_IMAGE,
  GET_IMAGES_WITH_REFERENCE_CHECK
} from 'api/media'

import { useAppSelector } from 'store/hooks'
import { selectIsMobile } from 'store/slices/window/windowSlice'

import Icon from '@mdi/react'
import { mdiAlertCircle, mdiDelete } from '@mdi/js'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Error } from 'components/Error'
import { ImagePreview } from 'components/ImagePreview'
import { PopoverMenu } from 'components/PopoverMenu'
import { PopoverMenuItem } from 'components/PopoverMenu/PopoverMenuItem'
import { Spinner } from 'components/Spinner'
import { ImageInfo } from './ImageInfo'

import type { FC } from 'react'
import type { fileSizeUnitLiteral } from 'types/commonProps'
import type { ImageData } from 'types/data'

const IMAGE_SIZE_UNIT: fileSizeUnitLiteral = 'MB'

export const ManageImagePage: FC = () => {
  const isMobile = useAppSelector(selectIsMobile)

  const { data, loading, error, refetch } = useQuery(
    GET_IMAGES_WITH_REFERENCE_CHECK,
    {
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true
    }
  )
  const [selectedImage, setSelectedImage] = useState<string>()
  const [
    loadImageInfo,
    queryRef,
    { refetch: refetchImage, reset: resetImage }
  ] = useLoadableQuery(GET_IMAGE, { fetchPolicy: 'cache-and-network' })

  const images = useMemo(() => data?.images ?? null, [data?.images])
  const unusedImages = useMemo(
    () =>
      images
        ?.filter((image) => !image.isReferenced)
        .map((image) => image.url) ?? [],
    [images]
  )

  const [_deleteImage, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_IMAGE, {
      notifyOnNetworkStatusChange: true
    })
  const [_pruneImages, { loading: pruning, reset: resetPruneMutation }] =
    useMutation(DELETE_IMAGES, {
      notifyOnNetworkStatusChange: true
    })

  const deleteImage = useCallback(
    ({ name, url }: ImageData) => {
      if (!window.confirm(`이미지 '${name}'를 삭제합니다.`)) return

      _deleteImage({
        variables: { url },
        refetchQueries: [{ query: GET_IMAGES_WITH_REFERENCE_CHECK }],
        onCompleted: () => resetImage(),
        onError: ({ networkError, graphQLErrors }) => {
          if (networkError) alert('이미지 삭제 중 오류가 발생했습니다.')
          else if (graphQLErrors.length) alert(graphQLErrors[0].message)
          resetDeleteMutation()
        }
      })
    },
    [_deleteImage, resetImage, resetDeleteMutation]
  )

  const pruneImages = useCallback(
    (urls: string[]) => {
      if (!window.confirm('사용된 적 없는 이미지들을 모두 제거합니다')) return

      _pruneImages({
        variables: { urls },
        refetchQueries: [{ query: GET_IMAGES_WITH_REFERENCE_CHECK }],
        onCompleted: () => resetImage(),
        onError: ({ networkError, graphQLErrors }) => {
          if (networkError) alert('이미지 삭제 중 오류가 발생했습니다.')
          else if (graphQLErrors.length) alert(graphQLErrors[0].message)
          resetPruneMutation()
        }
      })
    },
    [_pruneImages, resetImage, resetPruneMutation]
  )

  useEffect(() => {
    if (selectedImage)
      loadImageInfo({ url: selectedImage, unit: IMAGE_SIZE_UNIT })
    else resetImage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage])

  return (
    <div
      className={clsx(
        'flex items-center justify-center',
        isMobile && 'flex-col-reverse'
      )}
    >
      <div
        className={clsx(
          'relative flex min-h-0',
          isMobile ? 'w-full grow flex-col-reverse' : 'h-full w-3/4 flex-col'
        )}
      >
        <div
          className={clsx(
            'flex h-12 flex-row items-end border-neutral-100 p-2',
            isMobile ? 'border-t' : 'border-b'
          )}
        >
          <span className='mr-1 text-lg font-semibold'>
            {`${images?.length || 0}개 이미지`}
          </span>
          <ThemedButton
            variant='hover-text'
            color='error'
            disabled={!unusedImages.length}
            tooltip='미사용 이미지 정리'
            tooltipOptions={{ placement: 'right' }}
            onClick={() => pruneImages(unusedImages)}
          >
            {`(미사용: ${unusedImages.length || '없음'})`}
          </ThemedButton>
          <div className='grow' />
          {(loading || deleting || pruning) && (
            <Spinner
              className={clsx(
                'm-0 block',
                (deleting || pruning) && 'text-error'
              )}
              size='xs'
            />
          )}
        </div>

        <div className='relative min-h-0 grow overflow-y-auto p-4'>
          {deleting ||
            pruning ||
            (images && loading && (
              <div className='absolute inset-0 z-20 size-full bg-neutral-700 bg-opacity-5' />
            ))}
          {error && (
            <Error
              code={500}
              hideDefaultAction
              actions={[{ label: '다시 시도', handler: refetch }]}
            />
          )}
          {images && (
            <div
              className='grid max-h-full gap-3'
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
              {images.map((image) => (
                <ImagePreview
                  key={image.url}
                  image={image.url}
                  active={selectedImage === image.url}
                  scaleOnHover
                  onClick={setSelectedImage}
                >
                  {!image.isReferenced && (
                    <PopoverMenu
                      className='absolute bottom-1.5 left-1.5'
                      tooltipPlacement='right'
                      placement='bottom-start'
                      description='사용되지 않는 이미지'
                      menuBtn={
                        <Icon
                          className='text-warning'
                          path={mdiAlertCircle}
                          size={0.8}
                        />
                      }
                    >
                      <PopoverMenuItem
                        className='text-error'
                        icon={mdiDelete}
                        title='이미지 삭제'
                        loading={deleting}
                        disabled={image.isReferenced}
                        onClick={() => deleteImage(image)}
                      />
                    </PopoverMenu>
                  )}
                </ImagePreview>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={clsx(
          'relative flex flex-col items-center justify-center border-neutral-100 p-5',
          isMobile ? 'min-h-40 w-full border-b' : 'h-full w-1/4 border-l'
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
              <ImageInfo queryRef={queryRef} sizeUnit={IMAGE_SIZE_UNIT} />
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
