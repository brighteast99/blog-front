import { FC, Suspense, useEffect, useLayoutEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  TypedDocumentNode,
  gql,
  useLoadableQuery,
  useQuery
} from '@apollo/client'
import clsx from 'clsx'
import { useAppSelector } from 'app/hooks'
import { selectIsAuthenticated } from 'features/auth/authSlice'
import { Category, Post } from 'types/data'
import { Action, Error } from 'components/Error'
import Icon from '@mdi/react'
import { mdiLock, mdiMagnify, mdiPlus } from '@mdi/js'
import { PostList } from './postList'
import { Spinner } from 'components/Spinner'
import { SuspendedText } from 'components/SuspendedText'
import { ErrorBoundary } from 'react-error-boundary'
import { IconButton } from 'components/Buttons/IconButton'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'

export type PostsQueryResult = {
  posts: {
    edges: {
      cursor: string
      node: Post
    }[]
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string
      endCursor: string
    }
  }
}
export type PostsQueryVariables = { categoryId: number | null }

export const GET_CATEGORY: TypedDocumentNode<
  { category: Category },
  { id: number }
> = gql`
  query Category($id: Int) {
    category(id: $id) {
      id
      name
      isHidden
      description
      postCount
      coverImage
      subcategoryOf {
        id
      }
    }
  }
`
export const GET_POSTS: TypedDocumentNode<
  PostsQueryResult,
  PostsQueryVariables
> = gql`
  query Posts($categoryId: Decimal) {
    posts(categoryId: $categoryId) {
      edges {
        node {
          category {
            id
            name
            isHidden
            ancestors {
              id
              name
            }
          }
          id
          title
          content
          thumbnail
          isHidden
          createdAt
        }
      }
    }
  }
`

export const CategoryPage: FC = () => {
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const { categoryId } = useParams()
  const {
    data,
    loading,
    error,
    refetch: refetchCategory
  } = useQuery(GET_CATEGORY, {
    variables: { id: Number(categoryId) },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    skip:
      isNaN(Number(categoryId)) &&
      categoryId !== undefined &&
      categoryId !== 'all'
  })
  const [getPosts, queryRef, { refetch: refetchPosts }] = useLoadableQuery(
    GET_POSTS,
    { fetchPolicy: 'cache-and-network' }
  )
  const navigate = useNavigate()
  const location = useLocation()

  useLayoutEffect(() => {
    if (categoryId === undefined) navigate('/category/all', { replace: true })
  }, [categoryId, navigate])

  useEffect(() => {
    if (!loading && !error)
      getPosts({ categoryId: categoryId ? Number(categoryId) : null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, loading, error])

  if (error) {
    if (error.networkError)
      return (
        <Error
          message='게시판 정보를 불러오지 못했습니다'
          actions={[
            {
              label: '다시 시도',
              handler: () => refetchCategory()
            }
          ]}
        />
      )

    if (error.graphQLErrors.length) {
      const errorToShow = error.graphQLErrors[0]
      let actions: Action[] = [
        {
          label: '전체 게시글 보기',
          href: { to: '/category/all' }
        }
      ]
      if (errorToShow.extensions.code === 403)
        actions.unshift({
          label: '로그인',
          href: {
            to: `/login?next=${location.pathname}`,
            option: { replace: true }
          }
        })

      return (
        <Error
          code={errorToShow.extensions.code as number | undefined}
          message={errorToShow.message}
          actions={actions}
        />
      )
    }
  }

  return (
    <>
      {(loading || data?.category?.coverImage) && (
        <div
          className={clsx(
            'h-50 bg-cover bg-center blur-[2px] brightness-50',
            !data?.category?.coverImage &&
              loading &&
              'animate-pulse !bg-neutral-700'
          )}
          style={{
            backgroundImage: `url(${data?.category?.coverImage})`
          }}
        />
      )}
      <div
        className={clsx(
          'sticky top-0 z-20 px-6 py-2',
          (loading || data?.category?.coverImage) && '-mt-8 mb-8',
          loading && 'animate-pulse'
        )}
      >
        <div className='mb-2'>
          <div className='mb-1 flex items-center'>
            <SuspendedText
              className='text-5xl'
              text={data?.category?.name}
              length={4}
              loading={loading}
            />
            {data?.category?.isHidden && (
              <Icon
                path={mdiLock}
                size={1.2}
                className='ml-1 self-end text-neutral-700'
              />
            )}
          </div>
          <SuspendedText
            className='ml-2 text-lg font-light text-neutral-600'
            text={`${data?.category.postCount}개 게시물`}
            length={6}
            loading={loading}
          />
        </div>
        <SuspendedText
          className='pl-2 text-lg font-light'
          text={
            data?.category?.description ||
            `${data?.category?.name}의 모든 게시물`
          }
          lines={2}
          length={100}
          loading={loading}
        />
      </div>

      <div className='sticky top-0 z-10 -mt-28 h-32 w-full bg-background' />
      <div className='sticky top-32 z-10 mx-auto -mb-0.5 flex w-5/6 items-center border-b-2 border-neutral-600 bg-background py-2'>
        {isLoggedIn && (
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton
                className='p-0'
                path={mdiPlus}
                variant='hover-text'
                onClick={() => {
                  let path = '/post/new'
                  const id = Number(categoryId)
                  if (typeof id === 'number' && id > 0)
                    path += `?category=${categoryId}`
                  navigate(path)
                }}
              />
            </TooltipTrigger>
            <TooltipContent>새 글 쓰기</TooltipContent>
          </Tooltip>
        )}

        <div className='grow' />
        <input type='text' />
        <IconButton
          className='ml-1 p-0'
          path={mdiMagnify}
          variant='hover-text'
        />
      </div>
      <div className='mx-auto w-5/6'>
        <ErrorBoundary
          FallbackComponent={({ resetErrorBoundary }) => (
            <Error
              message='게시글 목록을 불러오지 못했습니다'
              actions={[
                {
                  label: '다시 시도',
                  handler: () => {
                    refetchPosts()
                    resetErrorBoundary()
                  }
                }
              ]}
            />
          )}
        >
          <Suspense fallback={<Spinner />}>
            {queryRef && <PostList queryRef={queryRef} />}
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  )
}
