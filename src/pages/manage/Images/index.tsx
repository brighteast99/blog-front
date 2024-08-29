import { Suspense, useCallback, useLayoutEffect, useMemo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useLoadableQuery, useQuery } from '@apollo/client'
import { GET_IMAGE, GET_IMAGES } from './api'

import { ImageInfo } from 'pages/manage/Images/ImageInfo'
import { Error } from 'components/Error'
import { ImagePreview } from 'components/ImagePreview'
import { Spinner } from 'components/Spinner'

import type { FC } from 'react'

export const ManageImagePage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useQuery(GET_IMAGES, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true
  })
  const selectedImage = searchParams.get('image')
  const [
    loadImageInfo,
    queryRef,
    { refetch: refetchImage, reset: resetImage }
  ] = useLoadableQuery(GET_IMAGE, { fetchPolicy: 'cache-and-network' })

  const images = useMemo(() => data?.images ?? null, [data?.images])

  const selectImage = useCallback(
    (url?: string, forced?: boolean) => {
      if (forced) {
        if (url) searchParams.set('image', url)
        else searchParams.delete('image')
        setSearchParams(searchParams, { replace: true })
        return
      }

      return navigate(`?image=${url}`, { replace: true })
    },
    [navigate, searchParams, setSearchParams]
  )

  useLayoutEffect(() => {
    if (selectedImage) loadImageInfo({ url: selectedImage })
    else resetImage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage])

  return (
    <div className='flex justify-center gap-2 p-5'>
      <div className='relative grow overflow-y-auto rounded border border-neutral-200 bg-neutral-50 p-4'>
        {loading && <Spinner className='absolute inset-0' />}
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
            {images.map(({ id, url }) => (
              <ImagePreview
                image={url}
                key={id}
                active={selectedImage === url}
                onClick={selectImage}
              />
            ))}
          </div>
        )}
      </div>

      <div className='relative w-1/3 overflow-y-auto rounded border border-neutral-200 bg-neutral-50'>
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
                onDelete={() => selectImage(undefined, true)}
              />
            ) : (
              <span className='absolute inset-0 m-auto block size-fit text-xl text-neutral-400'>
                이미지를 선택하세요
              </span>
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
