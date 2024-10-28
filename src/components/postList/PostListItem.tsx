import { useContext, useMemo } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

import { useAppSelector } from 'store/hooks'
import { selectBreakpoint } from 'store/slices/window/windowSlice'
import { getRelativeTimeFromNow } from 'utils/dayJS'

import Icon from '@mdi/react'
import { mdiLock, mdiPound } from '@mdi/js'
import { Badge } from 'components/Badge'
import { HighlightedText } from 'components/HighlightedText'
import { ImagePreview } from 'components/ImagePreview'
import { PostListSearchContext } from 'components/postList'

import type { FC } from 'react'
import type { PostSearchResult } from 'types/data'

export const PostListItem: FC<{
  post: PostSearchResult
  isActive?: boolean
}> = ({ post, isActive }) => {
  const searchArgs = useContext(PostListSearchContext)
  const breakpoint = useAppSelector(selectBreakpoint)
  const minimized = useMemo(() => breakpoint === 'mobile', [breakpoint])

  const titleArea = (
    <div className='flex flex-col gap-0.5'>
      <div className='text-base font-light text-neutral-700'>
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
            <Icon className='mb-0.5 ml-0.5 inline' path={mdiLock} size={0.5} />
          )}
        </Link>
      </div>

      <Link
        className={clsx(isActive && 'pointer-events-none text-primary')}
        to={`/post/${post.id}`}
        state={{ searchArgs }}
      >
        <HighlightedText
          className='inline-block max-w-full truncate text-2xl font-medium'
          text={post.title}
          highlights={post.titleHighlights}
        />
        {!post.category.isHidden && post.isHidden && (
          <Icon
            path={mdiLock}
            size={0.7}
            className='mb-1 ml-1 inline align-baseline text-neutral-700'
          />
        )}
      </Link>

      <p className='text-sm text-neutral-700'>
        {getRelativeTimeFromNow(post.createdAt)}
      </p>
    </div>
  )

  return (
    <li
      className={clsx(
        'flex h-80 flex-col px-2 py-4 last-of-type:!border-b-0',
        isActive && 'bg-primary bg-opacity-5'
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
            'flex h-full min-w-0 grow flex-col justify-between py-2',
            !minimized && 'justify-center gap-2 py-5'
          )}
        >
          {!minimized && titleArea}

          <HighlightedText
            className='line-clamp-4 font-thin text-neutral-800'
            text={post.textContent}
            highlights={post.contentHighlights}
            truncateStart
          />

          <div className='flex flex-wrap gap-2 justify-self-end'>
            {post.tags.map((tag) => (
              <Link key={tag} to={`/category/all?key=tag&value=${tag}`}>
                <Badge
                  size='sm'
                  color={searchArgs.tag?.includes(tag) ? 'success' : 'primary'}
                  icon={mdiPound}
                  interactive
                >
                  {tag}
                </Badge>
              </Link>
            ))}
            {post.tags.length === 0 && (
              <span className='text-sm text-neutral-600'>태그 미지정</span>
            )}
          </div>
        </div>

        {post.thumbnail && (
          <ImagePreview
            className={clsx(
              'shrink-0 outline-neutral-100',
              minimized ? 'h-full' : 'h-4/5'
            )}
            image={post.thumbnail}
            magnifyOnHover
          />
        )}
      </div>
    </li>
  )
}
