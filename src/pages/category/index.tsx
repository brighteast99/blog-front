import { FC, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { TypedDocumentNode, gql, useQuery } from '@apollo/client'
import clsx from 'clsx'
import { Category } from 'types/data'
import { PostList } from './postList'
import { Spinner } from 'components/Spinner'
import { SuspendedText } from 'components/SuspendedText'
import { ErrorBoundary } from 'react-error-boundary'
import { Error404 } from 'pages/errors/404'

const GET_CATEGORY_INFO: TypedDocumentNode<
  { categoryInfo: Category },
  { id: number }
> = gql`
  query CategoryInfo($id: Int) {
    categoryInfo(id: $id) {
      id
      name
      description
      postCount
      coverImage
    }
  }
`
export const CategoryPage: FC = () => {
  const { categoryId } = useParams()
  const { loading, data, error, refetch } = useQuery(GET_CATEGORY_INFO, {
    variables: { id: Number(categoryId) },
    skip: isNaN(Number(categoryId)) && categoryId !== 'all'
  })

  if (error)
    return (
      <Error404
        message='게시판 정보를 불러오지 못했습니다.'
        actions={[
          {
            label: '다시 시도',
            handler: () => refetch()
          }
        ]}
      />
    )

  if (!loading && !data?.categoryInfo)
    return (
      <Error404
        message='존재하지 않는 게시판입니다.'
        action={{ label: '전체 게시글 보기', to: '/category/all' }}
      />
    )

  return (
    <div className='size-full overflow-y-auto'>
      {data?.categoryInfo?.coverImage && (
        <div
          className='h-50 bg-cover bg-center'
          style={{
            backgroundImage: `url(${data?.categoryInfo?.coverImage})`
          }}
        />
      )}
      <div
        className={clsx(
          'sticky top-0 z-10 px-6 py-2',
          data?.categoryInfo?.coverImage && '-mt-8 mb-8',
          loading && 'animate-pulse'
        )}
      >
        <div className='mb-2'>
          <SuspendedText
            className='text-5xl'
            text={data?.categoryInfo?.name}
            length={4}
            loading={loading}
          />
          <SuspendedText
            className='ml-2 text-lg font-light text-neutral-600'
            text={
              !data?.categoryInfo?.postCount
                ? ''
                : `${data?.categoryInfo.postCount}개 게시물`
            }
            length={6}
            loading={loading}
          />
        </div>
        <SuspendedText
          className='pl-2 text-lg font-light'
          text={
            data?.categoryInfo?.description ??
            `${data?.categoryInfo?.name}의 모든 게시물`
          }
          lines={2}
          length={100}
          loading={loading}
        />
      </div>

      <div className='sticky top-0 -mt-28 h-32 w-full bg-background' />
      <div className='mx-auto w-5/6'>
        <ErrorBoundary
          FallbackComponent={({ resetErrorBoundary }) => (
            <Error
              message='게시글 목록을 불러오지 못했습니다.'
              actions={[{ label: '다시 시도', handler: resetErrorBoundary }]}
            />
          )}
        >
          <Suspense fallback={<Spinner />}>
            <PostList categoryId={Number(categoryId)} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
