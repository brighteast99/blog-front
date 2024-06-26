import { FC, Suspense, useCallback, useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  TypedDocumentNode,
  gql,
  useLoadableQuery,
  useMutation,
  useQuery
} from '@apollo/client'
import { Post } from 'types/data'
import { SuspendedText } from 'components/SuspendedText'
import { Error } from 'components/Error'
import { getRelativeTimeFromNow } from 'utils/dayJS'
import { Tiptap } from 'components/Tiptap'
import Icon from '@mdi/react'
import { mdiDelete, mdiLoading, mdiLock, mdiPencil } from '@mdi/js'
import { useAppSelector } from 'app/hooks'
import { selectIsAuthenticated } from 'features/auth/authSlice'
import { PopoverMenu } from 'components/PopoverMenu'
import { PopoverMenuItem } from 'components/PopoverMenu/PopoverMenuItem'
import { GET_CATEGORIES } from 'features/sidebar/Sidebar'
import { ErrorBoundary } from 'react-error-boundary'
import { Spinner } from 'components/Spinner'
import { PostList } from 'pages/category/postList'
import { GET_POSTS } from 'pages/category'

export const GET_POST: TypedDocumentNode<{ post: Post }, { id: number }> = gql`
  query PostData($id: Int!) {
    post(id: $id) {
      id
      title
      category {
        id
        name
        isHidden
        ancestors {
          id
          name
        }
      }
      isHidden
      thumbnail
      images
      createdAt
      content
    }
  }
`

const DELETE_POST: TypedDocumentNode<
  {
    deletePost: { success: boolean }
  },
  { id: number }
> = gql`
  mutation DeletePost($id: Int!) {
    deletePost(id: $id) {
      success
    }
  }
`

export const PostPage: FC = () => {
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const location = useLocation()
  const navigate = useNavigate()
  const { postId } = useParams()
  const { data, loading, error, refetch } = useQuery(GET_POST, {
    variables: { id: Number(postId) },
    notifyOnNetworkStatusChange: true,
    skip: isNaN(Number(postId))
  })
  const [_deletePost, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_POST)
  const [getPosts, queryRef, { refetch: refetchPostList }] = useLoadableQuery(
    GET_POSTS,
    { fetchPolicy: 'cache-and-network' }
  )

  const deletePost = useCallback(() => {
    if (!window.confirm('게시글을 삭제합니다.')) return

    _deletePost({
      variables: { id: Number(postId) },
      refetchQueries: [
        {
          query: GET_CATEGORIES
        }
      ],
      onCompleted: () => navigate(`/category/${data?.post.category.id}`),
      onError: () => {
        alert('게시글 삭제 중 문제가 발생했습니다.')
        resetDeleteMutation()
      }
    })
  }, [
    _deletePost,
    data?.post.category.id,
    navigate,
    postId,
    resetDeleteMutation
  ])

  useEffect(() => {
    if (!data) return
    const categoryId = data?.post.category.id
    if (!queryRef) getPosts({ categoryId: categoryId ?? null })
  }, [data, getPosts, queryRef])

  if (error?.networkError)
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

  if (
    error?.graphQLErrors.some(
      (error) =>
        error.message === 'You do not have permission to perform this action'
    )
  )
    return (
      <Error
        code={403}
        message='접근할 수 없는 게시글입니다'
        actions={[
          {
            label: '로그인',
            href: {
              to: `/login?next=${location.pathname}`,
              option: { replace: true }
            }
          },
          {
            label: '전체 게시글 보기',
            href: { to: '/category/all' }
          }
        ]}
      />
    )

  if (!loading && !data?.post)
    return (
      <Error
        code={404}
        message='존재하지 않는 게시글입니다'
        actions={[
          {
            label: '전체 게시글 보기',
            href: { to: '/category/all' }
          }
        ]}
      />
    )

  console.log(data?.post?.thumbnail)

  return (
    <>
      <div
        className='relative h-56 border-b border-neutral-300 bg-neutral-500 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `url(${data?.post?.thumbnail})`
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
            {data?.post.category?.ancestors &&
              data.post.category.ancestors.map((ancestor) => {
                return (
                  <div key={ancestor.id} className='contents'>
                    <Link to={`/category/${ancestor.id || 0}`}>
                      {ancestor.name}
                    </Link>
                    <span className='mx-1.5'>/</span>
                  </div>
                )
              })}
            <Link to={`/category/${data?.post?.category?.id || 0}`}>
              <SuspendedText
                loading={loading}
                text={data?.post?.category.name}
                align='center'
                length={6}
              />
            </Link>
            {data?.post?.category.isHidden && (
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
              text={data?.post?.title}
              align='center'
              length={100}
              lines={2}
            />
            {!data?.post?.category.isHidden && data?.post?.isHidden && (
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
            text={getRelativeTimeFromNow(data?.post?.createdAt || new Date())}
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
            content={data?.post?.content}
          />
        )}
      </div>

      {data && (
        <div className='border-t border-neutral-300 bg-neutral-50'>
          <div className='mx-auto w-full max-w-[1280px] p-10'>
            <ErrorBoundary
              FallbackComponent={({ resetErrorBoundary }) => (
                <Error
                  message='게시글 목록을 불러오지 못했습니다'
                  actions={[
                    {
                      label: '다시 시도',
                      handler: () => {
                        refetchPostList()
                        resetErrorBoundary()
                      }
                    }
                  ]}
                />
              )}
            >
              <Suspense fallback={<Spinner />}>
                <p className='mb-2 text-2xl'>
                  <Link to={`/category/${data?.post?.category?.id || 0}`}>
                    {data?.post?.category.name}
                  </Link>
                  의 다른 게시물
                </p>
                {queryRef && (
                  <PostList
                    queryRef={queryRef}
                    pageSize={5}
                    option={{ useQueryString: true, replace: true }}
                  />
                )}
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      )}
    </>
  )
}
