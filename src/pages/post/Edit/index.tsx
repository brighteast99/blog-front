import { FC, useCallback, useLayoutEffect, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'
import { TypedDocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { useAppSelector } from 'app/hooks'
import { selectIsAuthenticated } from 'features/auth/authSlice'
import { Category, Post, Template } from 'types/data'
import { GET_CATEGORIES } from 'features/sidebar/Sidebar'
import { GET_POSTS } from 'pages/category'
import { GET_POST } from 'pages/post'
import { Tiptap } from 'components/Tiptap'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'
import { Error } from 'components/Error'
import { Draft, DraftManager, GET_DRAFTS } from './DraftManager'
import { TemplateSelector } from './TemplateSelector'
import { NavigationBlocker } from 'components/NavigationBlocker'

const GET_POSTABLE_CATEGORIES: TypedDocumentNode<{ categories: Category[] }> =
  gql`
    query PostableCategories {
      categories {
        id
        name
        level
        isHidden
      }
    }
  `

const CREATE_DRAFT: TypedDocumentNode<
  { createDraft: { createdDraft: Post } },
  { data: PostInput }
> = gql`
  mutation CreateDraft($data: PostInput!) {
    createDraft(data: $data) {
      createdDraft {
        id
      }
    }
  }
`

const CREATE_POST: TypedDocumentNode<
  { createPost: { createdPost: Post } },
  { data: PostInput }
> = gql`
  mutation CreatePost($data: PostInput!) {
    createPost(data: $data) {
      createdPost {
        id
      }
    }
  }
`

const UPDATE_POST: TypedDocumentNode<
  { updatePost: { success: boolean } },
  { id?: number; data: PostInput }
> = gql`
  mutation CreatePost($id: Int!, $data: PostInput!) {
    updatePost(id: $id, data: $data) {
      success
    }
  }
`

const DELETE_IMAGE: TypedDocumentNode<
  { deleteImage: { success: boolean } },
  { url: String }
> = gql`
  mutation DeleteImage($url: String!) {
    deleteImage(url: $url) {
      success
    }
  }
`

export interface PostInput
  extends Omit<Post, 'id' | 'category' | 'createdAt' | 'updatedAt'> {
  category?: number
}

export const usePostInput = (_initialValue: PostInput) => {
  const [initialValue, setInitialValue] = useState<PostInput>(_initialValue)
  const [value, setValue] = useState<PostInput>(_initialValue)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const isModified = JSON.stringify(initialValue) !== JSON.stringify(value)

  const initialize = useCallback(
    (
      value: PostInput | ((prev: PostInput) => PostInput),
      keepInitialValue: boolean = false
    ) => {
      if (!keepInitialValue) setInitialValue(value)
      setValue(value)
    },
    [setInitialValue, setValue]
  )

  function modifyInput(key: string, value: any) {
    setValue((prev) => {
      return {
        ...prev,
        [key]: value
      }
    })
  }

  function setTitle(title: string) {
    modifyInput('title', title)
  }

  function setCategory(category?: number) {
    modifyInput('category', category)
  }

  function setIsHidden(isHidden: boolean) {
    modifyInput('isHidden', isHidden)
  }

  function setThumbnail(thumbnail: string | null) {
    if (thumbnail) modifyInput('thumbnail', thumbnail)
    else
      setValue((prev) => {
        let copy = { ...prev }
        delete copy.thumbnail

        return copy
      })
  }

  function setContent(content: string) {
    modifyInput('content', content)
  }

  function setImages(images: string[]) {
    modifyInput('images', images)
  }

  function addImage(image: string) {
    setValue((prev) => {
      return {
        ...prev,
        images: [...prev.images, image]
      }
    })
  }

  function removeImage(image: string) {
    setValue((prev) => {
      const idx = prev.images.findIndex((_image) => _image === image)
      if (idx === -1) return prev

      prev.images = prev.images.toSpliced(idx, 1)

      let copy = { ...prev }
      if (copy.thumbnail === image) delete copy.thumbnail

      return copy
    })
    setImagesToDelete((prev) => [...prev, image])
  }

  return {
    input: value,
    isModified,
    imagesToDelete,
    initialize,
    setTitle,
    setCategory,
    setIsHidden,
    setThumbnail,
    setContent,
    setImages,
    addImage,
    removeImage
  }
}

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
    setIsHidden,
    setThumbnail,
    addImage,
    removeImage,
    imagesToDelete
  } = usePostInput({
    title: '',
    category: Number(searchParams.get('category')) || undefined,
    isHidden: false,
    content: '<p></p>',
    images: []
  })
  const [selectedCategory, setSelectedCategory] = useState<{
    id?: number
    isHidden: boolean
  }>({
    isHidden: false
  })
  const {
    loading: loadingPost,
    error,
    data: post,
    refetch: reloadPost
  } = useQuery(GET_POST, {
    variables: { id: Number(postId) as number },
    skip: newPost || !postId,
    notifyOnNetworkStatusChange: true,
    onCompleted: ({ post }) => {
      initialize(
        {
          title: post.title,
          category: post.category.id,
          content: post.content,
          isHidden: post.isHidden,
          thumbnail: post.thumbnail,
          images: post.images
        }
      )
    }
  })
  const { loading: loadingCategories, data: categories } = useQuery(
    GET_POSTABLE_CATEGORIES,
    {
      skip: !isLoggedIn
    }
  )
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
      onCompleted: () => {
        window.alert('임시 저장되었습니다.')
      },
      onError: ({ graphQLErrors, networkError }) => {
        if (networkError) alert('임시 저장 중 오류가 발생했습니다.')
        else if (graphQLErrors?.length) {
          alert('존재하지 않는 분류입니다')
          setCategory(undefined)
        }
        resetCreateDraftMutation()
      }
    })
  }, [
    _createDraft,
    input,
    resetCreateDraftMutation,
    selectedCategory.isHidden,
    setCategory
  ])

  const createPost = useCallback(() => {
    _createPost({
      variables: {
        data: {
          ...input,
          isHidden: input.isHidden || selectedCategory.isHidden
        }
      },
      refetchQueries: [
        { query: GET_CATEGORIES },
        { query: GET_POSTS, variables: { categoryId: input.category ?? null } }
      ],
      onCompleted: ({ createPost }) => navigate(`/post/${createPost.createdPost.id}`),
      onError: ({ graphQLErrors, networkError }) => {
        if (networkError) alert('게시글 업로드 중 오류가 발생했습니다.')
        else if (graphQLErrors?.length) {
          alert('존재하지 않는 분류입니다')
          setCategory(undefined)
        }
        resetCreatePostMutation()
      }
    })
  }, [
    _createPost,
    input,
    navigate,
    resetCreatePostMutation,
    selectedCategory.isHidden,
    setCategory
  ])

  const updatePost = useCallback(() => {
    _updatePost({
      variables: {
        id: Number(postId),
        data: {
          ...input,
          isHidden: input.isHidden || selectedCategory.isHidden
        }
      },
      refetchQueries: [
        { query: GET_CATEGORIES },
        { query: GET_POST, variables: { id: Number(postId) } },
        {
          query: GET_POSTS,
          variables: { categoryId: post?.post.category.id ?? null }
        },
        { query: GET_POSTS, variables: { categoryId: input.category ?? null } }
      ],
      onCompleted: ({ updatePost: { success } }) => {
        if (!success) {
          resetUpdateMutation()
          return alert('게시글 수정 중 오류가 발생했습니다.')
        }
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
        ).then(() => navigate(`/post/${Number(postId)}`))
      },
      onError: ({ networkError }) => {
        if (networkError) alert('게시글 수정 중 오류가 발생했습니다.')
        resetUpdateMutation()
      }
    })
  }, [
    _updatePost,
    postId,
    input,
    selectedCategory.isHidden,
    post?.post.category.id,
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
    const selectedCategory = categories?.categories.find(
      (category) => category.id === input.category
    )
    setSelectedCategory({
      id: selectedCategory?.id,
      isHidden: Boolean(selectedCategory?.isHidden)
    })
  }, [categories?.categories, input.category])

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

  if (!newPost && !loadingPost && !error && !post?.post)
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
      {(loadingPost || error) && (
        <div className='absolute inset-0 z-10 flex size-full items-center justify-center bg-neutral-50 bg-opacity-75'>
          {error && (
            <Error
              message='게시글 정보를 불러오지 못했습니다'
              actions={[
                { label: '다시 시도', handler: () => reloadPost() },
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
        <select
          className='mb-3 w-full py-1'
          disabled={loadingCategories}
          value={input.category}
          onChange={(e) => setCategory(Number(e.target.value) || undefined)}
        >
          <option>분류 미지정</option>
          {categories?.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.level > 0 && '└' + '─'.repeat(category.level - 1) + ' '}
              {category.name}
              {category.isHidden && ' (비공개)'}
            </option>
          ))}
        </select>
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
              <label className='h-fit'>
                <input
                  className='mr-2 accent-primary'
                  type='checkbox'
                  disabled={selectedCategory?.isHidden}
                  checked={input.isHidden || selectedCategory?.isHidden}
                  onChange={(e) => setIsHidden(e.target.checked)}
                />
                비밀글
              </label>
            </TooltipTrigger>
            {selectedCategory.isHidden && (
              <TooltipContent>비공개 분류에 속하는 게시글입니다</TooltipContent>
            )}
          </Tooltip>
        </div>
        {!loadingPost && (
          <Tiptap
            className='mb-5 min-h-40 grow'
            content={input.content}
            onChange={(editor) => setContent(editor.getHTML())}
            thumbnail={input.thumbnail}
            images={input.images}
            onAddImage={addImage}
            onDeleteImage={removeImage}
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
