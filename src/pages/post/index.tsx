import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { throttle } from 'throttle-debounce'

import { useMutation, useQuery } from '@apollo/client'
import { DELETE_POST, GET_POST } from './api'
import { UPDATE_POST } from './Edit/api'
import { GET_CATEGORY_HIERARCHY } from 'pages/manage/Categories/api'

import { useAppSelector } from 'store/hooks'
import { selectIsAuthenticated } from 'store/slices/auth/authSlice'
import { getRelativeTimeFromNow } from 'utils/dayJS'
import { progress } from 'utils/useProgress'

import Icon from '@mdi/react'
import { mdiDelete, mdiLoading, mdiLock, mdiLockOpen, mdiPencil } from '@mdi/js'
import { Error } from 'components/Error'
import { PopoverMenu } from 'components/PopoverMenu'
import { PopoverMenuItem } from 'components/PopoverMenu/PopoverMenuItem'
import { PostList } from 'components/postList'
import { SuspendedText } from 'components/SuspendedText'
import { Tiptap } from 'components/Tiptap'

import type { FC } from 'react'
import type { Action } from 'components/Error'

export const PostPage: FC = () => {
  const titlebar = useRef<HTMLDivElement>(null)
  const contentArea = useRef<HTMLDivElement>(null)
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const location = useLocation()
  const navigate = useNavigate()
  const { postId } = useParams()
  const [titlebarTransform, setTitlebarTransform] = useState<number>(-1000)
  const [contentProgress, setContentProgress] = useState<number>(0)

  const {
    data: postData,
    loading,
    error,
    refetch
  } = useQuery(GET_POST, {
    variables: { id: postId || '' },
    notifyOnNetworkStatusChange: true,
    skip: !postId
  })
  const post = useMemo(() => postData?.post, [postData])

  const [_toggleIsHidden, { loading: updating, reset: resetUpdateMutation }] =
    useMutation(UPDATE_POST, { notifyOnNetworkStatusChange: true })

  const [_deletePost, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_POST, { notifyOnNetworkStatusChange: true })

  const toggleIsHidden = useCallback(() => {
    if (
      !post ||
      !window.confirm(
        (post?.isHidden ? '공개 게시글' : '비공개 게시글') + '로 전환합니다.'
      )
    )
      return

    _toggleIsHidden({
      variables: {
        id: postId as string,
        data: {
          category: post.category.id,
          title: post.title,
          content: post.content,
          textContent: post.textContent,
          images: post.images,
          thumbnail: post.thumbnail,
          isHidden: !post.isHidden
        }
      },
      refetchQueries: [{ query: GET_POST, variables: { id: postId } }],
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('게시글 수정 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetUpdateMutation()
      }
    })
  }, [_toggleIsHidden, post, postId, resetUpdateMutation])

  const deletePost = useCallback(() => {
    if (!window.confirm('게시글을 삭제합니다.')) return

    _deletePost({
      variables: { id: postId as string },
      refetchQueries: [{ query: GET_CATEGORY_HIERARCHY }],
      onCompleted: () => navigate(`/category/${post?.category.id}`),
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('게시글 삭제 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetDeleteMutation()
      }
    })
  }, [_deletePost, post?.category.id, navigate, postId, resetDeleteMutation])

  const MenuButton = ({ className }: { className?: string }) =>
    isLoggedIn ? (
      <PopoverMenu className={className} size={0.9} closeOnScroll>
        <PopoverMenuItem
          icon={mdiPencil}
          title='수정'
          onClick={() => navigate(`/post/edit/${postId}`)}
        />
        <PopoverMenuItem
          icon={updating ? mdiLoading : post?.isHidden ? mdiLock : mdiLockOpen}
          disabled={updating}
          title={post?.isHidden ? '비공개 게시글' : '공개 게시글'}
          description={post?.isHidden ? '게시글 보이기' : '게시글 숨기기'}
          onClick={toggleIsHidden}
        />
        <PopoverMenuItem
          icon={deleting ? mdiLoading : mdiDelete}
          disabled={deleting}
          title='삭제'
          className='bg-error text-error'
          onClick={deletePost}
        />
      </PopoverMenu>
    ) : null

  // * 헤더 위치 조절
  useLayoutEffect(() => {
    const handler = throttle(20, (e: Event) => {
      const target = (e.target as Document)?.documentElement
      const scrollPosition = target?.scrollTop || 0

      const CONTENT_START = Number(contentArea.current?.offsetTop)
      const CONTENT_END =
        Number(contentArea.current?.offsetTop) +
        Number(contentArea.current?.clientHeight)
      setContentProgress(
        progress(
          0,
          Math.max(0, CONTENT_END - Number(target?.clientHeight)),
          scrollPosition
        )
      )

      const TITLE_TRANSITION_AMOUNT = titlebar.current?.clientHeight || 0
      const TITLE_SHOW_POINT = CONTENT_START - TITLE_TRANSITION_AMOUNT
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

  useLayoutEffect(() => {
    if (postId)
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      })
  }, [postId])

  if (error) {
    if (error.networkError)
      return (
        <Error
          message='게시글 정보를 불러오지 못했습니다'
          actions={[
            {
              label: '다시 시도',
              handler: () => refetch()
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
      if (errorToShow.extensions?.code === 403)
        actions.unshift({
          label: '로그인',
          href: {
            to: `/login?next=${location.pathname}`,
            option: { replace: true }
          }
        })

      return (
        <Error
          code={(errorToShow.extensions?.code as number) || undefined}
          message={errorToShow.message}
          actions={actions}
        />
      )
    }
  }

  return (
    <>
      <div
        ref={titlebar}
        className='sticky top-0 z-10 w-full bg-neutral-100 bg-opacity-75 shadow-lg backdrop-blur-sm will-change-auto'
        style={{
          transform: `translateY(${titlebarTransform}%)`,
          marginTop: '-4.125rem'
        }}
      >
        <div className='relative h-0.5 bg-neutral-50'>
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
          <Link className='text-sm' to={`/category/${post?.category?.id || 0}`}>
            {post?.category?.name}
          </Link>
          <p className='text-lg'>{post?.title}</p>
          <MenuButton className='absolute inset-y-0 right-5 my-auto h-fit' />
        </div>
      </div>

      <div
        className='relative h-64 border-b border-neutral-200 bg-neutral-500 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `url(${post?.thumbnail})`
        }}
      >
        <div className='flex size-full flex-col items-center justify-center gap-1 py-5 backdrop-blur backdrop-brightness-50'>
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
                size={0.6}
                className='ml-0.5 mt-1 inline align-text-bottom'
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
                size={0.7}
                className='mb-1 ml-1 inline self-end text-neutral-700'
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

      <div ref={contentArea} className='min-h-[30dvh] w-full px-5 py-12'>
        <div className='mx-auto w-full max-w-[1280px]'>
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
        <div className='border-t border-neutral-300 bg-neutral-50'>
          <div className='relative mx-auto w-full max-w-[1280px] bg-inherit p-8 pb-0'>
            <p className='sticky top-0 z-10 -mt-0.5 border-b-2 border-neutral-600 bg-inherit py-2 text-2xl'>
              <Link to={`/category/${post.category?.id || 0}`}>
                {post.category.name}
              </Link>
              의 다른 게시물
            </p>
            <PostList
              filterArgs={{ categoryId: post.category?.id }}
              initialPagination={{ targetPost: post.id }}
            />
          </div>
        </div>
      )}
    </>
  )
}
