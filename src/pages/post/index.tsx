import { useCallback, useMemo } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { useMutation, useQuery } from '@apollo/client'
import { DELETE_POST, GET_POST } from './api'
import { UPDATE_POST } from './Edit/api'
import { GET_CATEGORY_HIERARCHY } from 'pages/manage/Categories/api'

import { useAppSelector } from 'app/hooks'
import { getRelativeTimeFromNow } from 'utils/dayJS'
import { selectIsAuthenticated } from 'features/auth/authSlice'

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
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const location = useLocation()
  const navigate = useNavigate()
  const { postId } = useParams()

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
      refetchQueries: [
        {
          query: GET_POST,
          variables: {
            id: postId
          }
        }
      ],
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
      refetchQueries: [
        {
          query: GET_CATEGORY_HIERARCHY
        }
      ],
      onCompleted: () => navigate(`/category/${post?.category.id}`),
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('게시글 삭제 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetDeleteMutation()
      }
    })
  }, [_deletePost, post?.category.id, navigate, postId, resetDeleteMutation])

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
        className='relative h-56 border-b border-neutral-300 bg-neutral-500 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `url(${post?.thumbnail})`
        }}
      >
        {isLoggedIn && (
          <PopoverMenu className='absolute right-1 top-1 z-10' size={0.9}>
            <PopoverMenuItem
              icon={mdiPencil}
              title='수정'
              onClick={() => navigate(`/post/edit/${postId}`)}
            />
            <PopoverMenuItem
              icon={
                updating ? mdiLoading : post?.isHidden ? mdiLock : mdiLockOpen
              }
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
        )}
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
        </div>
      </div>

      <div className='mx-auto w-full max-w-[1280px] px-5 py-10'>
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

      {post && (
        <div className='border-t border-neutral-300 bg-neutral-50'>
          <div className='mx-auto w-full max-w-[1280px] p-10'>
            <p className='mb-2 text-2xl'>
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
