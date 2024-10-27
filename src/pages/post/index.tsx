import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { useMutation, useQuery } from '@apollo/client'
import { GET_CATEGORY_HIERARCHY } from 'api/category'
import { DELETE_POST, GET_POST, UPDATE_POST } from 'api/post'

import { useAppSelector } from 'store/hooks'
import { selectIsAuthenticatedAndActive } from 'store/slices/auth/authSlice'
import { useDialog } from 'hooks/useDialog'

import { PostPageView } from 'pages/post/view'
import { Error } from 'components/Error'

import type { FC } from 'react'
import type { Action } from 'components/Error'
import type { PostSearchArgs } from 'components/postList'
import type { Category } from 'types/data'

const PostPage: FC = () => {
  const isLoggedIn = useAppSelector(selectIsAuthenticatedAndActive)
  const location = useLocation()
  const navigate = useNavigate()
  const { postId } = useParams()
  const showDialog = useDialog()
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
  const searchArgs: PostSearchArgs | undefined = useMemo(
    () => location.state?.searchArgs,
    [location.state]
  )
  const searchKeyword: string = useMemo(
    () =>
      searchArgs?.titleAndContent ||
      searchArgs?.title ||
      searchArgs?.content ||
      '',
    [searchArgs]
  )
  const asPostOf: Partial<Category> | undefined = useMemo(() => {
    if (searchArgs === undefined) return post?.category
    if (searchArgs.categoryId === post?.category?.id) return post?.category

    return (
      post?.category.ancestors?.find(
        (category) => category.id === searchArgs.categoryId
      ) ?? {
        id: undefined,
        name: '전체 게시글'
      }
    )
  }, [searchArgs, post?.category])

  const [_toggleIsHidden, { loading: updating, reset: resetUpdateMutation }] =
    useMutation(UPDATE_POST, { notifyOnNetworkStatusChange: true })

  const [_deletePost, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_POST, { notifyOnNetworkStatusChange: true })

  const toggleIsHidden = useCallback(async () => {
    if (
      !post ||
      !(await showDialog(
        `${post?.isHidden ? '공개 게시글' : '비공개 게시글'}로 전환합니다.`,
        'CONFIRM'
      ))
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
          tags: post.tags,
          thumbnail: post.thumbnail,
          isHidden: !post.isHidden
        }
      },
      refetchQueries: [{ query: GET_POST, variables: { id: postId } }],
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) showDialog('게시글 수정 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) showDialog(graphQLErrors[0].message)
        resetUpdateMutation()
      }
    })
  }, [_toggleIsHidden, post, postId, resetUpdateMutation, showDialog])

  const deletePost = useCallback(async () => {
    if (!(await showDialog('게시글을 삭제합니다.', 'NEGATIVECONFIRM'))) return

    _deletePost({
      variables: { id: postId as string },
      refetchQueries: [{ query: GET_CATEGORY_HIERARCHY }],
      onCompleted: () => navigate(`/category/${post?.category.id}`),
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) showDialog('게시글 삭제 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) showDialog(graphQLErrors[0].message)
        resetDeleteMutation()
      }
    })
  }, [
    _deletePost,
    navigate,
    post?.category.id,
    postId,
    resetDeleteMutation,
    showDialog
  ])

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
    <PostPageView
      post={post}
      asPostOf={asPostOf}
      searchArgs={searchArgs}
      searchKeyword={searchKeyword}
      showMenu={isLoggedIn}
      loading={loading}
      updating={updating}
      deleting={deleting}
      toggleIsHidden={toggleIsHidden}
      deletePost={deletePost}
    />
  )
}

export default PostPage
