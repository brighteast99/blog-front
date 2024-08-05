import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'

import { useMutation, useQuery } from '@apollo/client'
import {
  CREATE_DRAFT,
  CREATE_POST,
  DELETE_IMAGE,
  GET_POSTABLE_CATEGORIES,
  UPDATE_POST
} from './api'
import { GET_DRAFTS } from './DraftManager/api'
import { GET_CATEGORY_HIERARCHY } from 'pages/manage/Categories/api'
import { GET_POST } from 'pages/post/api'

import { useAppSelector } from 'app/hooks'
import { selectIsAuthenticated } from 'features/auth/authSlice'

import { mdiLock, mdiLockOpen } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Error } from 'components/Error'
import { Spinner } from 'components/Spinner'
import { Tiptap } from 'components/Tiptap'
import { NavigationBlocker } from 'components/utils/NavigationBlocker'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'
import { DraftManager } from './DraftManager'
import { usePostInput } from './hooks'
import { TemplateSelector } from './TemplateSelector'

import type { FC } from 'react'
import type { Draft, Template } from 'types/data'
import type { PostInput } from './api'

export const EditPostPage: FC<{ newPost?: boolean }> = ({
  newPost = false
}) => {
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const location = useLocation()
  const navigate = useNavigate()
  const { postId } = useParams()
  const [searchParams] = useSearchParams()

  const {
    input,
    isModified,
    initialize,
    setCategory,
    setTitle,
    setContent,
    setTextContent,
    setIsHidden,
    setThumbnail,
    addImage,
    removeImage,
    imagesToDelete
  } = usePostInput({
    title: '',
    category: Number(searchParams.get('category')) || 0,
    isHidden: false,
    content: '<p></p>',
    textContent: '',
    images: []
  })

  const {
    loading: loadingPost,
    error: errorLoadingPost,
    refetch: refetchPost
  } = useQuery(GET_POST, {
    variables: { id: postId },
    skip: newPost || !postId,
    notifyOnNetworkStatusChange: true,
    onCompleted: ({ post }) => {
      initialize({
        title: post.title,
        category: post.category.id,
        content: post.content,
        textContent: post.textContent,
        isHidden: post.isHidden,
        thumbnail: post.thumbnail,
        images: post.images
      })
    }
  })

  const {
    data: categoriesData,
    loading: loadingCategories,
    error: errorLoadingCategories,
    refetch: refetchCategories
  } = useQuery(GET_POSTABLE_CATEGORIES, {
    skip: !isLoggedIn,
    notifyOnNetworkStatusChange: true
  })
  const categories = useMemo(() => categoriesData?.categories, [categoriesData])

  const [
    _createDraft,
    { loading: creatingDraft, reset: resetCreateDraftMutation }
  ] = useMutation(CREATE_DRAFT)
  const [
    _createPost,
    { loading: creatingPost, reset: resetCreatePostMutation }
  ] = useMutation(CREATE_POST)
  const [_updatePost, { loading: updatingPost, reset: resetUpdateMutation }] =
    useMutation(UPDATE_POST)
  const [deleteImage, { loading: deletingImages }] = useMutation(DELETE_IMAGE)

  const [selectedCategory, setSelectedCategory] = useState<{
    id?: number
    isHidden: boolean
  }>({
    isHidden: false
  })

  const importDraft = useCallback(
    (draft: Draft) => {
      if (!draft) return
      if (
        !window.confirm(
          '임시 저장본을 불러오면 기존에 작성한 내용은 모두 사라집니다'
        )
      )
        return

      initialize({
        category: draft.category.id,
        title: draft.title,
        content: draft.content,
        textContent: draft.textContent,
        isHidden: draft.isHidden,
        thumbnail: draft.thumbnail,
        images: draft.images
      })
    },
    [initialize]
  )

  const importTemplate = useCallback(
    (template: Template) => {
      if (!template) return
      if (
        !window.confirm(
          '템플릿을 불러오면 기존에 작성한 내용은 모두 사라집니다'
        )
      )
        return

      initialize((prev) => {
        return {
          category: prev.category,
          title: prev.title,
          content: template.content,
          textContent: template.textContent,
          isHidden: prev.isHidden,
          thumbnail: template.thumbnail,
          images: template.images
        }
      })
    },
    [initialize]
  )

  const createDraft = useCallback(() => {
    _createDraft({
      variables: {
        data: {
          ...input,
          isHidden: input.isHidden || selectedCategory.isHidden
        }
      },
      refetchQueries: [{ query: GET_DRAFTS }],
      onCompleted: () => window.alert('임시 저장되었습니다.'),
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('임시 저장 중 오류가 발생했습니다.')
        else if (graphQLErrors?.length) alert(graphQLErrors[0].message)
        resetCreateDraftMutation()
      }
    })
  }, [_createDraft, input, resetCreateDraftMutation, selectedCategory.isHidden])

  const createPost = useCallback(() => {
    _createPost({
      variables: {
        data: {
          ...input,
          isHidden: input.isHidden || selectedCategory.isHidden
        }
      },
      refetchQueries: [{ query: GET_CATEGORY_HIERARCHY }],
      onCompleted: ({ createPost: { createdPost } }) =>
        navigate(`/post/${createdPost.id}`),
      onError: ({ graphQLErrors, networkError }) => {
        if (networkError) alert('게시글 업로드 중 오류가 발생했습니다.')
        else if (graphQLErrors?.length) alert(graphQLErrors[0].message)
        resetCreatePostMutation()
      }
    })
  }, [
    _createPost,
    input,
    navigate,
    resetCreatePostMutation,
    selectedCategory.isHidden
  ])

  const updatePost = useCallback(() => {
    _updatePost({
      variables: {
        id: postId as string,
        data: {
          ...input,
          isHidden: input.isHidden || selectedCategory.isHidden
        }
      },
      refetchQueries: [
        { query: GET_CATEGORY_HIERARCHY },
        { query: GET_POST, variables: { id: postId } }
      ],
      onCompleted: () => {
        Promise.all(
          imagesToDelete.map((image) => {
            return new Promise((resolve) => {
              deleteImage({
                variables: {
                  url: image
                },
                onCompleted: () => resolve(null),
                onError: () => resolve(null)
              })
            })
          })
        ).then(() => navigate(`/post/${postId}`))
      },
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('게시글 수정 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetUpdateMutation()
      }
    })
  }, [
    _updatePost,
    postId,
    input,
    selectedCategory.isHidden,
    imagesToDelete,
    resetUpdateMutation,
    deleteImage,
    navigate
  ])

  useLayoutEffect(() => {
    if (!isLoggedIn)
      navigate(`/login?next=${location.pathname}`, { replace: true })
  }, [isLoggedIn, location.pathname, navigate])

  useLayoutEffect(() => {
    const selectedCategory = categoriesData?.categories.find(
      (category) => category.id === input.category
    )
    setSelectedCategory({
      id: selectedCategory?.id,
      isHidden: Boolean(selectedCategory?.isHidden)
    })
  }, [categoriesData?.categories, input.category])

  useLayoutEffect(() => {
    const stashDraft = () => {
      if (document.hidden)
        return sessionStorage.setItem('draft', JSON.stringify(input))

      try {
        const draft = JSON.parse(
          sessionStorage.getItem('draft') ?? '{}'
        ) as PostInput
        sessionStorage.removeItem('draft')
        initialize(draft, true)
      } catch {
        //
      }
    }
    document.addEventListener('visibilitychange', stashDraft)

    return () => document.removeEventListener('visibilitychange', stashDraft)
  }, [initialize, input])

  if (errorLoadingPost?.graphQLErrors[0]?.extensions?.code === 404)
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

  return (
    <>
      {(loadingPost || errorLoadingPost?.networkError) && (
        <div className='absolute inset-0 z-10 flex size-full items-center justify-center bg-neutral-50 bg-opacity-75'>
          {errorLoadingPost?.networkError && (
            <Error
              message='게시글 정보를 불러오지 못했습니다'
              actions={[
                { label: '다시 시도', handler: () => refetchPost() },
                { label: '게시글로 이동', href: { to: `/post/${postId}` } }
              ]}
            />
          )}
          {loadingPost && <Spinner />}
        </div>
      )}

      <div className='mx-auto w-full max-w-[1280px] px-5 py-10'>
        <NavigationBlocker
          enabled={
            isModified && !creatingPost && !updatingPost && !deletingImages
          }
          message={`${newPost ? '작성' : '수정'}중인 내용이 있습니다.\n페이지를 벗어나시겠습니까?`}
        />

        <div className='mb-3 flex w-full items-center justify-between gap-2'>
          <DraftManager onSelect={importDraft} />
          <TemplateSelector onSelect={importTemplate} />
        </div>

        <div className='mb-3 flex w-full gap-2'>
          <select
            className='grow py-1'
            disabled={loadingCategories || Boolean(errorLoadingCategories)}
            value={input.category}
            onChange={(e) => setCategory(Number(e.target.value) || undefined)}
          >
            <option value={0}>
              {errorLoadingCategories ? '게시판 정보 로드 실패' : '분류 미지정'}
            </option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.level > 0 &&
                  '└' + '─'.repeat(category.level - 1) + ' '}
                {category.name}
                {category.isHidden && ' (비공개)'}
              </option>
            ))}
          </select>
          {errorLoadingCategories && (
            <ThemedButton
              className='h-8 px-2'
              variant='flat'
              onClick={() => refetchCategories()}
              color='primary'
            >
              {loadingCategories ? <Spinner size='xs' /> : '다시 시도'}
            </ThemedButton>
          )}
        </div>

        <div className='mb-3 flex w-full flex-wrap items-center gap-2'>
          <input
            className='min-w-0 grow text-2xl'
            type='text'
            placeholder='게시글 제목'
            value={input.title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={(e) => setTitle(e.target.value.trim())}
            required
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton
                path={input.isHidden ? mdiLock : mdiLockOpen}
                variant='hover-text-toggle'
                color='primary'
                disabled={selectedCategory?.isHidden}
                active={input.isHidden}
                onClick={() => setIsHidden(!input.isHidden)}
              />
            </TooltipTrigger>
            <TooltipContent>
              {selectedCategory.isHidden
                ? '비공개 분류에 속하는 게시글입니다'
                : (input.isHidden ? '공개 게시글' : '비공개 게시글') +
                  '로 전환'}
            </TooltipContent>
          </Tooltip>
        </div>

        {!loadingPost && !errorLoadingPost && (
          <Tiptap
            className='mb-5 min-h-40 grow'
            content={input.content}
            onChange={(editor) => {
              setContent(editor.getHTML())
              setTextContent(editor.getText())
            }}
            thumbnail={input.thumbnail}
            images={input.images}
            onImageUploaded={addImage}
            onImageDeleted={removeImage}
            onChangeThumbnail={setThumbnail}
          />
        )}

        <ThemedButton
          className='mb-2 h-10 w-full py-0.5 text-lg'
          variant='flat'
          color='primary'
          disabled={
            !input.title ||
            creatingDraft ||
            creatingPost ||
            updatingPost ||
            deletingImages
          }
          onClick={newPost ? createPost : updatePost}
        >
          {creatingDraft || creatingPost || updatingPost || deletingImages ? (
            <Spinner size='xs' />
          ) : newPost ? (
            '게시'
          ) : (
            '수정'
          )}
        </ThemedButton>
        <ThemedButton
          className='h-10 w-full py-0.5 text-lg'
          variant='text'
          color='secondary'
          disabled={
            !input.title ||
            creatingDraft ||
            creatingPost ||
            updatingPost ||
            deletingImages
          }
          onClick={createDraft}
        >
          {creatingDraft || creatingPost || updatingPost || deletingImages ? (
            <Spinner size='xs' />
          ) : (
            '임시 저장'
          )}
        </ThemedButton>
      </div>
    </>
  )
}
