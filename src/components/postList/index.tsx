import { FC, useCallback, useMemo, useRef } from 'react'
import clsx from 'clsx'
import { Link, useLocation, useSearchParams } from 'react-router-dom'

import { useQuery } from '@apollo/client'
import { GET_POSTS } from './api'

import { useAppSelector } from 'app/hooks'
import { getRelativeTimeFromNow } from 'utils/dayJS'
import { selectBreakpoint } from 'features/window/windowSlice'

import Icon from '@mdi/react'
import { mdiLock } from '@mdi/js'
import { Error } from 'components/Error'
import { Paginator } from 'components/Paginator'
import { Spinner } from 'components/Spinner'
import { HighlightedText } from 'components/utils/HighlightedText'

import type { Post } from 'types/data'

export const PostItem: FC<{ post: Post; isActive?: boolean }> = ({
  post,
  isActive
}) => {
  const breakpoint = useAppSelector(selectBreakpoint)
  const minimized = useMemo(() => breakpoint === 'mobile', [breakpoint])

  const titleArea = (
    <>
      <span className='text-sm font-light text-neutral-700'>
        {post.category?.ancestors &&
          post.category.ancestors.map((ancestor) => {
            return (
              <div key={ancestor.id} className='contents'>
                <Link to={`/category/${ancestor.id}`}>{ancestor.name}</Link>
                <span className='mx-1'>/</span>
              </div>
            )
          })}
        <Link to={`/category/${post.category?.id}`}>
          {post.category?.name || '분류 미지정'}
          {post.category.isHidden && (
            <Icon className='ml-0.5 inline' path={mdiLock} size={0.5} />
          )}
        </Link>
      </span>

      <Link to={`/post/${post.id}`}>
        <HighlightedText
          className='inline truncate text-2xl font-medium'
          text={post.title}
          highlights={post.titleHighlights}
        />
        {!post.category.isHidden && post.isHidden && (
          <Icon
            path={mdiLock}
            size={0.6}
            className='mb-0.5 ml-1 inline align-text-bottom text-neutral-700'
          />
        )}
      </Link>

      <p className='text-sm text-neutral-700'>
        {getRelativeTimeFromNow(post.createdAt)}
      </p>
    </>
  )

  return (
    <li
      className={clsx(
        'flex h-72 flex-col px-2 py-4 last-of-type:!border-b-0',
        isActive && 'bg-secondary bg-opacity-10'
      )}
    >
      {minimized && (
        <div className='flex grow flex-col justify-center gap-1'>
          {titleArea}
        </div>
      )}
      <div
        className={clsx(
          'flex items-center gap-10',
          minimized ? 'h-40' : 'h-full'
        )}
      >
        <div
          className={clsx(
            'flex grow flex-col',
            !minimized && 'flex min-w-0 grow flex-col justify-center gap-2 py-5'
          )}
        >
          {!minimized && titleArea}

          <HighlightedText
            className='line-clamp-4 font-thin text-neutral-800'
            text={post.textContent}
            highlights={post.contentHighlights}
            truncateStart
          />
        </div>

        {post.thumbnail && (
          <div
            className={clsx(
              'aspect-square shrink-0',
              minimized ? 'h-full' : 'h-4/5'
            )}
          >
            <img
              src={post.thumbnail}
              alt='thumbnail'
              className='block size-full object-contain'
            />
          </div>
        )}
      </div>
    </li>
  )
}

export interface PostListProps {
  pageSize?: number
  filterArgs?: {
    categoryId?: number
    titleAndContent?: string
    title?: string
    content?: string
  }
  initialPagination?: {
    targetPost?: string
    offset?: number
  }
  useSearchParam?: string
  logHistory?: boolean
}

export const PostList: FC<PostListProps> = ({
  pageSize = 5,
  filterArgs = {},
  initialPagination = {},
  useSearchParam,
  logHistory
}) => {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const listRef = useRef<HTMLUListElement>(null)
  const {
    data: postsData,
    loading,
    error,
    refetch
  } = useQuery(GET_POSTS, {
    variables: {
      pageSize,
      ...filterArgs,
      ...initialPagination
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true
  })
  const posts = useMemo(() => postsData?.posts.posts, [postsData])
  const pageInfo = useMemo(() => postsData?.posts.pageInfo, [postsData])

  const handlePageChange = useCallback(
    (page: number) => {
      if (useSearchParam) {
        searchParams.set(useSearchParam, page.toString())
        setSearchParams(searchParams, { replace: !logHistory })
      }
      refetch({
        pageSize,
        offset: pageSize * page,
        targetPost: undefined,
        ...filterArgs
      })
    },
    [
      refetch,
      pageSize,
      filterArgs,
      logHistory,
      searchParams,
      setSearchParams,
      useSearchParam
    ]
  )

  if (error)
    return (
      <Error
        message='게시글 목록을 불러오지 못했습니다'
        actions={[
          {
            label: '다시 시도',
            handler: () => refetch()
          }
        ]}
      />
    )

  if (loading) return <Spinner className='my-10' />

  if (!posts) return

  if (!posts.length)
    return (
      <div className='max-h-full w-full py-5 text-center text-neutral-400'>
        아직 게시물이 없습니다
      </div>
    )

  return (
    <>
      <ul
        ref={listRef}
        className='divide-y border-neutral-600 *:border-neutral-600'
      >
        {posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            isActive={location.pathname === `/post/${post.id}`}
          />
        ))}
      </ul>
      <Paginator
        className='sticky inset-x-0 bottom-0 mx-auto border-t-2 border-neutral-600 bg-inherit'
        currentPage={pageInfo?.currentPage || 0}
        pages={pageInfo?.pages || 1}
        onPageChanged={handlePageChange}
      />
    </>
  )
}
