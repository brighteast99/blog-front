import { FC, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'

import { QueryReference, useReadQuery } from '@apollo/client'
import { mdiLock } from '@mdi/js'
import Icon from '@mdi/react'
import clsx from 'clsx'

import { getRelativeTimeFromNow } from 'utils/dayJS'

import { Post } from 'types/data'

import { PostsQueryResult, PostsQueryVariables } from '.'

export const PostItem: FC<{ post: Post; isActive?: boolean }> = ({
  post,
  isActive
}) => {
  const extractText = useCallback((content: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')

    const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT)

    let texts = []
    let node
    while ((node = walker.nextNode())) {
      texts.push(node.textContent)
    }

    return texts.join(' ').trim()
  }, [])

  return (
    <li
      className={clsx(
        'flex h-72 items-center gap-10 px-2 py-4',
        isActive && 'bg-secondary bg-opacity-10'
      )}
    >
      <div className='flex min-w-0 grow flex-col justify-center gap-2 py-5'>
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
          <p className='truncate text-2xl font-medium'>
            {post.title}
            {!post.category.isHidden && post.isHidden && (
              <Icon
                path={mdiLock}
                size={0.6}
                className='mb-0.5 ml-1 inline align-text-bottom text-neutral-700'
              />
            )}
          </p>
        </Link>

        <p className='mb-1 text-sm text-neutral-700'>
          {getRelativeTimeFromNow(post.createdAt)}
        </p>

        <p className='line-clamp-4 font-thin text-neutral-800'>
          {extractText(post.content)}
        </p>
      </div>

      {post.thumbnail && (
        <div className='aspect-square h-4/5 shrink-0'>
          <img
            src={post.thumbnail}
            alt='thumbnail'
            className='block size-full object-contain'
          />
        </div>
      )}
    </li>
  )
}

export interface PostListProps {
  queryRef: QueryReference<PostsQueryResult, PostsQueryVariables>
  pageSize?: number
  option?: {
    useQueryString?: boolean
    replace?: boolean
  }
}

export const PostList: FC<PostListProps> = ({
  queryRef,
  pageSize: _pageSize = 10,
  option = { useQueryString: true, replace: false }
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const listRef = useRef<HTMLUListElement>(null)
  const [{ pageSize, currentPage, pages }, setPagination] = useState({
    pageSize: _pageSize,
    currentPage: 0,
    pages: 1
  })

  const {
    data: {
      posts: { edges: posts }
    }
  } = useReadQuery(queryRef)

  useLayoutEffect(() => {
    setPagination((prev) => {
      return {
        ...prev,
        currentPage: 0,
        pages: Math.ceil(posts.length / prev.pageSize)
      }
    })
  }, [posts.length])

  useLayoutEffect(() => {
    if (!option.useQueryString) return

    const page = Number(searchParams.get('page'))

    if (!Number.isNaN(page) && currentPage !== page - 1)
      setPagination((prev) => {
        return {
          ...prev,
          currentPage: Math.max(0, page - 1)
        }
      })
  }, [currentPage, searchParams, option.useQueryString])

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
        className='divide-y border-y-2 border-neutral-600 *:border-neutral-600'
      >
        {posts
          .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
          .map((post) => (
            <PostItem
              key={post.node.id}
              post={post.node}
              isActive={location.pathname === `/post/${post.node.id}`}
            />
          ))}
      </ul>

      <div className='flex justify-center gap-2 py-1'>
        {Array.from({ length: pages }, (_, i) => {
          const isActive = currentPage === i
          return (
            <button
              key={i}
              className={clsx(
                'p-1',
                isActive
                  ? 'text-primary'
                  : 'text-neutral-500 hover:text-neutral-800'
              )}
              disabled={isActive}
              onClick={() => {
                if (!option.useQueryString)
                  return setPagination((prev) => {
                    return {
                      ...prev,
                      currentPage: i
                    }
                  })

                searchParams.set('page', (i + 1).toString())
                setSearchParams(searchParams, { replace: option.replace })
              }}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </>
  )
}
