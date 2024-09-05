import { createContext, useCallback, useMemo, useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

import { useQuery } from '@apollo/client'
import { GET_POSTS } from './api'

import { Error } from 'components/Error'
import { Paginator } from 'components/Paginator'
import { Spinner } from 'components/Spinner'
import { PostListItem } from './PostListItem'

import type { FC } from 'react'
import type { PostSortCondition } from './api'

export interface PostSearchArgs {
  categoryId?: number
  titleAndContent?: string
  title?: string
  content?: string
}

export interface PostListProps {
  pageSize?: number
  searchArgs?: PostSearchArgs
  initialPagination?: {
    targetPost?: string
    offset?: number
  }
  sortCondition?: PostSortCondition
  useSearchParam?: string
  logHistory?: boolean
}

export const PostListSearchContext = createContext<PostSearchArgs>({})

export const PostList: FC<PostListProps> = ({
  pageSize = 5,
  searchArgs = {},
  initialPagination = {},
  sortCondition = 'recent',
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
      ...searchArgs,
      ...initialPagination,
      orderBy: sortCondition
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
        ...searchArgs
      })
    },
    [
      refetch,
      pageSize,
      searchArgs,
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
    <PostListSearchContext.Provider value={searchArgs}>
      <ul
        ref={listRef}
        className='divide-y border-neutral-600 *:border-neutral-600'
      >
        {posts.map((post) => (
          <PostListItem
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
    </PostListSearchContext.Provider>
  )
}
