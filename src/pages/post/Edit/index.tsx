import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
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
  GET_POSTABLE_CATEGORIES,
  UPDATE_DRAFT,
  UPDATE_POST
} from './api'
import { GET_DRAFTS } from './DraftManager/api'
import { GET_CATEGORY_HIERARCHY } from 'pages/manage/Categories/api'
import { GET_POST } from 'pages/post/api'

import { useAppSelector } from 'store/hooks'
import { selectIsAuthenticatedAndActive } from 'store/slices/auth/authSlice'
import { useToggle } from 'hooks/useToggle'

import { EditPostPageView } from 'pages/post/Edit/view'
import { Error } from 'components/Error'
import { usePostInput } from './hooks'

import type { FC } from 'react'
import type { Draft, Template } from 'types/data'

export const EditPostPage: FC<{ newPost?: boolean }> = ({
  newPost = false
}) => {
  const isLoggedIn = useAppSelector(selectIsAuthenticatedAndActive)
  const location = useLocation()
  const navigate = useNavigate()
  const { postId } = useParams()
  const [searchParams] = useSearchParams()
  const [draftId, setDraftId] = useState<number>()
  const { value: loaded, setTrue: load } = useToggle(newPost)

  const {
    postInput,
    hasChange,
    initialize,
    setCategory,
    setTitle,
    setContent,
    setTextContent,
    setIsHidden,
    setThumbnail,
    addImage,
    addImages,
    removeImage
  } = usePostInput({
    title: '',
    category: Number(searchParams.get('category')) || undefined,
    isHidden: false,
    content: '<p></p>',
    textContent: '',
    images: []
  })
  const inputRef = useRef(postInput)

  const {
    loading: loadingPost,
    error: errorLoadingPost,
    refetch: refetchPost
  } = useQuery(GET_POST, {
    variables: { id: postId },
    skip: newPost || !postId,
    notifyOnNetworkStatusChange: true,
    onCompleted: ({ post }) => {
      load()
      initialize({
        title: post.title,
        category: post.category.id || undefined,
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

  const [_createDraft, { loading: creatingDraft, error: errorCreatingDraft }] =
    useMutation(CREATE_DRAFT)
  const [_updateDraft, { loading: updatingDraft, error: errorUpdatingDraft }] =
    useMutation(UPDATE_DRAFT)
  const [
    _createPost,
    { loading: creatingPost, reset: resetCreatePostMutation }
  ] = useMutation(CREATE_POST)
  const [
    _updatePost,
    { loading: updatingPost, reset: resetUpdatePostMutation }
  ] = useMutation(UPDATE_POST)

  const selectedCategory = useMemo(
    () =>
      categoriesData?.categories.find(
        (category) => category.id === postInput.category
      ),
    [categoriesData, postInput.category]
  )

  const importDraft = useCallback(
    (draft: Draft) => {
      if (!draft) return
      if (
        !window.confirm(
          '임시 저장본을 불러오면 기존에 작성한 내용은 모두 사라집니다'
        )
      )
        return

      setDraftId(draft.id)
      initialize({
        category: draft.category.id || undefined,
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

      initialize((prev) => ({
        category: prev.category,
        title: template.title,
        content: template.content,
        textContent: template.textContent,
        isHidden: prev.isHidden,
        thumbnail: template.thumbnail,
        images: template.images
      }))
    },
    [initialize]
  )

  const saveChanges = useCallback(
    (asNew?: boolean) => {
      if (!hasChange && draftId) return

      if (!draftId || asNew)
        _createDraft({
          variables: {
            data: {
              ...inputRef.current,
              isHidden:
                inputRef.current.isHidden || !!selectedCategory?.isHidden
            }
          },
          refetchQueries: [{ query: GET_DRAFTS }],
          onCompleted: ({
            createDraft: {
              createdDraft: { id }
            }
          }) => {
            initialize(inputRef.current)
            setDraftId(id)
          }
        })
      else
        _updateDraft({
          variables: {
            id: draftId as number,
            data: {
              ...inputRef.current,
              isHidden:
                inputRef.current.isHidden || !!selectedCategory?.isHidden
            }
          },
          refetchQueries: [{ query: GET_DRAFTS }],
          onCompleted: () => initialize(inputRef.current)
        })
    },
    [
      hasChange,
      draftId,
      _createDraft,
      _updateDraft,
      initialize,
      selectedCategory?.isHidden
    ]
  )
  const saveRef = useRef(saveChanges)

  const createPost = useCallback(
    () =>
      _createPost({
        variables: {
          data: {
            ...inputRef.current,
            isHidden: inputRef.current.isHidden || !!selectedCategory?.isHidden
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
      }),
    [_createPost, navigate, resetCreatePostMutation, selectedCategory?.isHidden]
  )

  const updatePost = useCallback(
    () =>
      _updatePost({
        variables: {
          id: postId as string,
          data: {
            ...inputRef.current,
            isHidden: inputRef.current.isHidden || !!selectedCategory?.isHidden
          }
        },
        refetchQueries: [
          { query: GET_CATEGORY_HIERARCHY },
          { query: GET_POST, variables: { id: postId } }
        ],
        onCompleted: () => navigate(`/post/${postId}`),
        onError: ({ networkError, graphQLErrors }) => {
          if (networkError) alert('게시글 수정 중 오류가 발생했습니다.')
          else if (graphQLErrors.length) alert(graphQLErrors[0].message)
          resetUpdatePostMutation()
        }
      }),
    [
      _updatePost,
      postId,
      selectedCategory?.isHidden,
      resetUpdatePostMutation,
      navigate
    ]
  )

  // * redirect to login page when not logged in
  useLayoutEffect(() => {
    if (!isLoggedIn)
      navigate(`/login?next=${location.pathname}`, { replace: true })
  }, [isLoggedIn, location.pathname, navigate])

  // * update refs
  useEffect(() => {
    saveRef.current = saveChanges
  }, [saveChanges])

  useEffect(() => {
    inputRef.current = postInput
  }, [postInput])

  // * Auto save changes periodically
  useEffect(() => {
    const interval = setInterval(() => saveRef.current(), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (errorLoadingPost) {
    if (errorLoadingPost.networkError)
      return (
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
        </div>
      )

    if (errorLoadingPost.graphQLErrors?.length) {
      const errorToShow = errorLoadingPost.graphQLErrors[0]

      return (
        <Error
          code={(errorToShow.extensions?.code as number) || undefined}
          message={errorToShow.message}
          actions={[
            {
              label: '전체 게시글 보기',
              href: { to: '/category/all' }
            }
          ]}
        />
      )
    }
  }

  return (
    <EditPostPageView
      newPost={newPost}
      draftId={draftId}
      categories={categoriesData?.categories}
      selectedCategory={selectedCategory}
      loadingCategories={loadingCategories}
      errorLoadingCategories={!!errorLoadingCategories}
      refetchCategories={refetchCategories}
      importDraft={importDraft}
      onDraftDeleted={(id) =>
        setDraftId((prev) => (draftId === id ? undefined : prev))
      }
      importTemplate={importTemplate}
      loadingPost={loadingPost || !loaded}
      inputs={postInput}
      setTitle={setTitle}
      setCategory={setCategory}
      setIsHidden={setIsHidden}
      setContent={setContent}
      setTextContent={setTextContent}
      setThumbnail={setThumbnail}
      addImage={addImage}
      addImages={addImages}
      removeImage={removeImage}
      hasChange={hasChange}
      submitting={creatingPost || updatingPost}
      submit={newPost ? createPost : updatePost}
      saving={creatingDraft || updatingDraft}
      save={saveChanges}
      saveFailed={!!(errorCreatingDraft || errorUpdatingDraft)}
    />
  )
}
