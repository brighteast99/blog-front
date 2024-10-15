import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { throttle } from 'throttle-debounce'

import { getRelativeTimeFromNow } from 'utils/dayJS'
import { progress } from 'utils/useProgress'

import Icon from '@mdi/react'
import { mdiDelete, mdiLock, mdiLockOpen, mdiPencil } from '@mdi/js'
import { PopoverMenu } from 'components/PopoverMenu'
import { PopoverMenuItem } from 'components/PopoverMenu/PopoverMenuItem'
import { PostList } from 'components/postList'
import { SuspendedText } from 'components/SuspendedText'
import { Tiptap } from 'components/Tiptap'

import type { FC } from 'react'
import type { PostSearchArgs } from 'components/postList'
import type { Category, Post } from 'types/data'

interface PostPageViewProps {
  post?: Post
  asPostOf?: Partial<Category>
  searchArgs?: PostSearchArgs
  searchKeyword?: string
  showMenu?: boolean
  loading: boolean
  updating: boolean
  deleting: boolean
  toggleIsHidden: () => any
  deletePost: () => any
}

export const PostPageView: FC<PostPageViewProps> = ({
  post = undefined,
  asPostOf = undefined,
  searchArgs,
  searchKeyword = '',
  showMenu = false,
  loading,
  updating,
  deleting,
  toggleIsHidden,
  deletePost
}) => {
  const titlebar = useRef<HTMLDivElement>(null)
  const titleArea = useRef<HTMLDivElement>(null)
  const contentArea = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [titlebarTransform, setTitlebarTransform] = useState<number>(-1000)
  const [contentProgress, setContentProgress] = useState<number>(0)

  const MenuButton = ({
    className,
    disabled
  }: {
    className?: string
    disabled?: boolean
  }) =>
    showMenu ? (
      <PopoverMenu
        className={className}
        size={0.9}
        closeOnScroll
        disabled={disabled}
      >
        <PopoverMenuItem
          icon={mdiPencil}
          title='수정'
          disabled={updating || deleting}
          onClick={() => navigate(`/post/edit/${post?.id}`)}
        />
        <PopoverMenuItem
          icon={post?.isHidden ? mdiLock : mdiLockOpen}
          loading={updating}
          disabled={updating || deleting}
          title={post?.isHidden ? '비공개 게시글' : '공개 게시글'}
          description={post?.isHidden ? '게시글 보이기' : '게시글 숨기기'}
          onClick={toggleIsHidden}
        />
        <PopoverMenuItem
          icon={mdiDelete}
          loading={deleting}
          disabled={deleting}
          title='삭제'
          className='bg-error text-error'
          onClick={deletePost}
        />
      </PopoverMenu>
    ) : null

  // * 헤더 위치 조절
  useEffect(() => {
    const handler = throttle(20, (e: Event) => {
      const target = (e.target as Document)?.documentElement
      const scrollPosition = target?.scrollTop || 0

      const CONTENT_START = Number(contentArea.current?.offsetTop)
      const CONTENT_END =
        Number(contentArea.current?.offsetTop) +
        Number(contentArea.current?.clientHeight)
      setContentProgress(
        progress(
          CONTENT_START,
          Math.max(CONTENT_START, CONTENT_END - Number(target?.clientHeight)),
          scrollPosition
        )
      )

      const TITLE_TRANSITION_AMOUNT = titlebar.current?.clientHeight || 0
      const TITLE_SHOW_POINT = ((titleArea.current?.clientHeight ?? 0) * 2) / 5
      const TITLE_HIDE_POINT = CONTENT_END - TITLE_TRANSITION_AMOUNT

      if (scrollPosition < TITLE_SHOW_POINT || scrollPosition > CONTENT_END)
        setTitlebarTransform(-1000)
      else if (scrollPosition < TITLE_HIDE_POINT)
        setTitlebarTransform(
          (progress(
            TITLE_SHOW_POINT,
            TITLE_SHOW_POINT + TITLE_TRANSITION_AMOUNT,
            scrollPosition
          ) -
            1) *
            100
        )
      else if (scrollPosition < CONTENT_END)
        setTitlebarTransform(
          -progress(TITLE_HIDE_POINT, CONTENT_END, scrollPosition) * 100
        )
    })

    document.addEventListener('scroll', handler)
    return () => document.removeEventListener('scroll', handler)
  }, [])

  // * 페이지 이동시 스크롤 위로 이동
  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    })
  }, [post])

  return (
    <>
      <div
        ref={titlebar}
        className='sticky top-0 z-10 w-full bg-background bg-opacity-75 backdrop-blur-sm will-change-auto'
        style={{
          transform: `translateY(${titlebarTransform}%)`,
          marginTop: '-4.13rem'
        }}
      >
        <div className='relative h-0.5'>
          <div
            className='absolute h-full w-full bg-primary will-change-transform'
            style={{
              transform: `scaleX(${contentProgress})`,
              transformOrigin: 'left',
              transition: 'transform cubic-bezier(0.4, 0, 0.2, 1) 100ms'
            }}
          />
        </div>

        <div className='relative h-16 pt-1.5 text-center'>
          {post?.category?.ancestors &&
            post?.category.ancestors.map((ancestor) => {
              return (
                <div key={ancestor.id} className='contents'>
                  <Link to={`/category/${ancestor.id || 0}`}>
                    {ancestor.name}
                  </Link>
                  <span className='mx-1.5'>/</span>
                </div>
              )
            })}
          <Link className='text-sm' to={`/category/${post?.category?.id || 0}`}>
            {post?.category?.name}
          </Link>
          {post?.category.isHidden && (
            <Icon
              path={mdiLock}
              size={0.4}
              className='ml-0.5 mt-0.5 inline align-baseline'
            />
          )}
          <p className='text-lg'>
            {post?.title}
            {!post?.category.isHidden && post?.isHidden && (
              <Icon
                path={mdiLock}
                size={0.5}
                className='ml-0.5 inline align-middle text-neutral-700'
              />
            )}
          </p>
          <MenuButton
            className='absolute inset-y-0 right-5 my-auto h-fit'
            disabled={loading}
          />
        </div>
      </div>

      <div
        className='sticky top-0 -mt-72 h-72 w-full bg-neutral-200 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: `url(${post?.thumbnail})` }}
      />

      <div
        ref={titleArea}
        className='relative h-72 border-b border-neutral-200 backdrop-blur-sm backdrop-brightness-50'
      >
        <div className='flex size-full flex-col items-center justify-center gap-1 py-5'>
          <div className='flex items-center justify-center text-lg text-neutral-800'>
            {post?.category?.ancestors &&
              post?.category.ancestors.map((ancestor) => {
                return (
                  <div key={ancestor.id} className='contents'>
                    <Link to={`/category/${ancestor.id || 0}`}>
                      {ancestor.name}
                    </Link>
                    <span className='mx-1.5'>/</span>
                  </div>
                )
              })}
            <Link to={`/category/${post?.category?.id || 0}`}>
              <SuspendedText
                loading={loading}
                text={post?.category.name}
                align='center'
                length={6}
              />
            </Link>
            {post?.category.isHidden && (
              <Icon
                path={mdiLock}
                size={0.5}
                className='ml-0.5 mt-0.5 inline align-baseline'
              />
            )}
          </div>

          <div className='flex w-3/5 items-center justify-center'>
            <SuspendedText
              className='text-4xl font-medium'
              loading={loading}
              text={post?.title}
              align='center'
              length={100}
              lines={2}
            />
            {!post?.category.isHidden && post?.isHidden && (
              <Icon
                path={mdiLock}
                size={0.8}
                className='ml-1 mt-3.5 inline align-baseline text-neutral-700'
              />
            )}
          </div>

          <SuspendedText
            className='font-thin text-neutral-700'
            loading={loading}
            text={getRelativeTimeFromNow(post?.createdAt || new Date())}
            align='center'
            length={8}
          />
        </div>{' '}
        <MenuButton className='absolute right-5 top-2.5' />
      </div>

      <div
        ref={contentArea}
        className='relative min-h-[30dvh] w-full bg-background px-5 pb-32 pt-12'
      >
        <div className='mx-auto w-full max-w-[1080px]'>
          {loading ? (
            <SuspendedText
              className='font-thin'
              loading={true}
              align='left'
              lines={5}
              length={100}
            />
          ) : (
            <Tiptap
              className='bg-transparent'
              editable={false}
              content={post?.content}
            />
          )}
        </div>
      </div>

      {post && (
        <div className='relative bg-background'>
          <div className='relative mx-auto w-full max-w-[1280px] bg-inherit p-8 pb-0'>
            <p className='sticky top-0 z-10 -mt-0.5 border-b-2 border-neutral-600 bg-inherit py-2 text-2xl'>
              <Link to={`/category/${asPostOf?.id}`}>{asPostOf?.name}</Link>
              {searchKeyword
                ? `의 검색 결과 (${searchKeyword})`
                : '의 다른 게시글'}
            </p>
            <PostList
              searchArgs={{
                ...searchArgs,
                categoryId: asPostOf?.id
              }}
              initialPagination={{ targetPost: post.id }}
            />
          </div>
        </div>
      )}
    </>
  )
}
