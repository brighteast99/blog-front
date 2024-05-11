import { FC, useCallback, useLayoutEffect, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'
import { TypedDocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { Category, Post } from 'types/data'
import { Tiptap } from 'components/Tiptap'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'
import { useAppSelector } from 'app/hooks'
import { selectIsAuthenticated } from 'features/auth/authSlice'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'
import { GET_CATEGORIES } from 'features/sidebar/Sidebar'
import { GET_POST } from '.'
import { Error } from 'components/Error'

const GET_POSTABLE_CATEGORIES: TypedDocumentNode<{ categories: Category[] }> =
  gql`
    query PostableCategories {
      categories {
        id
        name
        isHidden
      }
    }
  `

const CREATE_POST: TypedDocumentNode<
  { createPost: { createdPost: Post } },
  { data: Draft }
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
  { id?: number; data: Draft }
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

export interface Draft
  extends Omit<Post, 'id' | 'category' | 'createdAt' | 'updatedAt'> {
  category?: number
}

export const useDraft = (initialValue: Draft) => {
  const [draft, setDraft] = useState<Draft>(initialValue)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  function modifyDraft(key: string, value: any) {
    setDraft((prev) => {
      return {
        ...prev,
        [key]: value
      }
    })
  }

  function setTitle(title: string) {
    modifyDraft('title', title)
  }

  function setCategory(category?: number) {
    modifyDraft('category', category)
  }

  function setIsHidden(isHidden: boolean) {
    modifyDraft('isHidden', isHidden)
  }

  function setThumbnail(thumbnail: string | null) {
    if (thumbnail) modifyDraft('thumbnail', thumbnail)
    else
      setDraft((prev) => {
        let copy = { ...prev }
        delete copy.thumbnail

        return copy
      })
  }

  function setContent(content: string) {
    modifyDraft('content', content)
  }

  function setImages(images: string[]) {
    modifyDraft('images', images)
  }

  function addImage(image: string) {
    setDraft((prev) => {
      return {
        ...prev,
        images: [...prev.images, image]
      }
    })
  }

  function removeImage(image: string) {
    setDraft((prev) => {
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
    draft,
    imagesToDelete,
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
    draft,
    setCategory,
    setTitle,
    setContent,
    setIsHidden,
    setThumbnail,
    setImages,
    addImage,
    removeImage,
    imagesToDelete
  } = useDraft({
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
      setTitle(post.title)
      setCategory(post.category.id)
      setContent(post.content)
      setIsHidden(post.isHidden)
      setThumbnail(post.thumbnail ?? null)
      setImages(post.images)
    }
  })
  const { loading: loadingCategories, data: categories } = useQuery(
    GET_POSTABLE_CATEGORIES
  )
  const [_createPost, { loading: creating, reset: resetCreateMutation }] =
    useMutation(CREATE_POST)
  const [_updatePost, { loading: updating, reset: resetUpdateMutation }] =
    useMutation(UPDATE_POST)
  const [deleteImage, { loading: deleteingImages }] = useMutation(DELETE_IMAGE)

  const createPost = useCallback(() => {
    _createPost({
      variables: {
        data: {
          ...draft,
          isHidden: draft.isHidden || selectedCategory.isHidden
        }
      },
      refetchQueries: [{ query: GET_CATEGORIES }],
      onCompleted: ({ createPost }) => {
        navigate(`/post/${createPost.createdPost.id}`)
      },
      onError: ({ graphQLErrors, networkError }) => {
        if (networkError) alert('게시글 업로드 중 오류가 발생했습니다.')
        else if (graphQLErrors?.length) {
          alert('존재하지 않는 분류입니다')
          setCategory(undefined)
        }
        resetCreateMutation()
      }
    })
  }, [
    _createPost,
    draft,
    navigate,
    resetCreateMutation,
    selectedCategory.isHidden,
    setCategory
  ])

  const updatePost = useCallback(() => {
    _updatePost({
      variables: {
        id: Number(postId),
        data: {
          ...draft,
          isHidden: draft.isHidden || selectedCategory.isHidden
        }
      },
      refetchQueries: [
        { query: GET_CATEGORIES },
        { query: GET_POST, variables: { id: Number(postId) } }
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
    deleteImage,
    draft,
    imagesToDelete,
    navigate,
    postId,
    resetUpdateMutation,
    selectedCategory.isHidden
  ])

  useLayoutEffect(() => {
    if (!isLoggedIn)
      navigate(`/login?next=${location.pathname}`, { replace: true })
  }, [isLoggedIn, location.pathname, navigate])

  useLayoutEffect(() => {
    const selectedCategory = categories?.categories.find(
      (category) => category.id === draft.category
    )
    setSelectedCategory({
      id: selectedCategory?.id,
      isHidden: Boolean(selectedCategory?.isHidden)
    })
  }, [categories?.categories, draft.category])

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
    <div className='size-full overflow-y-auto p-10'>
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
      <div className='w-full'>
        <div className='mb-3 flex w-full items-center gap-2'>
          <select
            className='w-1/6 min-w-40 max-w-52'
            disabled={loadingCategories}
            value={draft.category}
            onChange={(e) => setCategory(Number(e.target.value) || undefined)}
          >
            <option>분류 미지정</option>
            {categories?.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.isHidden && ' (비공개)'}
              </option>
            ))}
          </select>
          <input
            className='min-w-0 grow text-2xl'
            type='text'
            placeholder='게시글 제목'
            value={draft.title}
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
                  checked={draft.isHidden || selectedCategory?.isHidden}
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
            content={draft.content}
            onChange={(editor) => setContent(editor.getHTML())}
            thumbnail={draft.thumbnail}
            images={draft.images}
            onAddImage={addImage}
            onDeleteImage={removeImage}
            onChangeThumbnail={setThumbnail}
          />
        )}

        <ThemedButton
          className='h-10 w-full py-0.5 text-lg'
          variant='flat'
          color='primary'
          disabled={!draft.title || creating || updating}
          onClick={newPost ? createPost : updatePost}
        >
          {creating || updating ? (
            <Spinner size='xs' />
          ) : newPost ? (
            '게시'
          ) : (
            '수정'
          )}
        </ThemedButton>
      </div>
    </div>
  )
}
