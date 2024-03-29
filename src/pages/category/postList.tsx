import { FC, useLayoutEffect, useRef, useState } from 'react'
import { gql, useSuspenseQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import { getRelativeTimeFromNow } from 'utils/timeFormatter'
import { Post } from 'types/data'
import Icon from '@mdi/react'
import { mdiLock } from '@mdi/js'
import clsx from 'clsx'

const GET_POSTS = gql`
  query PostList($categoryId: Int) {
    postList(categoryId: $categoryId) {
      category {
        id
        name
      }
      id
      title
      content
      thumbnail
      isHidden
      createdAt
      updatedAt
    }
  }
`

export const PostItem: FC<{ post: Post }> = ({ post }) => {
  const isUpdated = post.createdAt !== post.updatedAt

  return (
    <li>
      <Link
        className='group flex h-36 gap-2 px-3 py-1.5 hover:bg-neutral-100'
        to={`/post/${post.id}`}
      >
        <div className='flex min-w-0 grow flex-col'>
          <p className='truncate text-lg font-bold'>
            {post.isHidden && (
              <Icon
                path={mdiLock}
                size={0.8}
                className='mr-1 mt-0.5 inline align-text-top text-neutral-700'
              />
            )}
            {post.title}
          </p>

          <p className='mb-1 text-sm font-light text-neutral-700'>
            {post.category?.name && (
              <span className='font-semibold'>
                {post.category?.name || '분류 미지정'} |{' '}
              </span>
            )}
            {isUpdated
              ? `${getRelativeTimeFromNow(post.updatedAt)} (수정됨)`
              : getRelativeTimeFromNow(post.createdAt)}
          </p>

          <p className='line-clamp-3 text-neutral-800'>{post.content}</p>
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
      </Link>
    </li>
  )
}

export interface PostListProps {
  categoryId?: number
  cursor?: number
}

export const PostList: FC<PostListProps> = ({ categoryId }) => {
  const listRef = useRef<HTMLUListElement>(null)
  const [{ pageSize, currentPage, pages }, setPagination] = useState({
    pageSize: 10,
    currentPage: 0,
    pages: 1
  })

  const allPosts = categoryId === undefined
  const { data } = useSuspenseQuery<{ postList: Post[] }>(GET_POSTS, {
    variables: { categoryId: allPosts ? null : categoryId }
  })

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
