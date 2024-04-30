import { FC, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { QueryReference, useReadQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import { getRelativeTimeFromNow, isSameTime } from 'utils/dayJS'
import { Post } from 'types/data'
import Icon from '@mdi/react'
import { mdiLock } from '@mdi/js'
import clsx from 'clsx'
import { PostListQueryResult, PostListQueryVariables } from '.'

export const PostItem: FC<{ post: Post }> = ({ post }) => {
  const isUpdated = !isSameTime(post.createdAt, post.updatedAt)

  const extractText = useCallback((content: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    return doc.body.textContent
  }, [])

  return (
    <li className='flex h-50 items-center gap-2 py-2'>
      <div className='flex min-w-0 grow flex-col justify-center gap-1 py-5'>
        <Link
          to={`/category/${post.category?.id}`}
          className='text-sm font-light text-neutral-700'
        >
          {post.category?.name || '분류 미지정'}
          {post.category.isHidden && (
            <Icon
              className='ml-0.5 inline text-neutral-700'
              path={mdiLock}
              size={0.5}
            />
          )}
        </Link>

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
          {isUpdated
            ? `${getRelativeTimeFromNow(post.updatedAt)} (수정됨)`
            : getRelativeTimeFromNow(post.createdAt)}
        </p>

        <p className='line-clamp-3 font-thin text-neutral-800'>
          {extractText(post.content)}
        </p>
      </div>

      {post.thumbnail && (
        <div className='aspect-square h-full shrink-0 p-1.5'>
          <img
            src={post.thumbnail}
            alt='thumbnail'
            className='block size-full'
          />
        </div>
      )}
    </li>
  )
}

export interface PostListProps {
  queryRef: QueryReference<PostListQueryResult, PostListQueryVariables>
  cursor?: number
}

export const PostList: FC<PostListProps> = ({ queryRef }) => {
  const listRef = useRef<HTMLUListElement>(null)
  const [{ pageSize, currentPage, pages }, setPagination] = useState({
    pageSize: 10,
    currentPage: 0,
    pages: 1
  })

  const { data } = useReadQuery(queryRef)

  useLayoutEffect(() => {
    setPagination((prev) => {
      return {
        ...prev,
        currentPage: 0,
        pages: Math.ceil(data.postList.length / prev.pageSize)
      }
    })
  }, [data.postList.length])

  if (!data.postList.length)
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
        {data?.postList
          .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
          .map((post) => <PostItem key={post.id} post={post} />)}
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
              onClick={() =>
                setPagination((prev) => {
                  return { ...prev, currentPage: i }
                })
              }
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </>
  )
}
