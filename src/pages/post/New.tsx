import { FC, useLayoutEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { TypedDocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { Category, Post } from 'types/data'
import { Tiptap } from 'components/Tiptap'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'
import { useAppSelector } from 'app/hooks'
import { selectIsAuthenticated } from 'features/auth/authSlice'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'
import { GET_CATEGORY_INFO, GET_POSTS } from 'pages/category'
import { GET_CATEGORIES } from 'features/sidebar/Sidebar'

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
  mutation CreatePost($data: CreatePostInput!) {
    createPost(data: $data) {
      createdPost {
        id
      }
    }
  }
`

export interface Draft {
  title: string
  category: number
  isHidden: boolean
  thumbnail?: string
  content: string
}

export const useDraft = (initialValue: Draft) => {
  const [draft, setDraft] = useState<Draft>(initialValue)

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

  function setCategory(category: number) {
    if (category < 0) category = 0
    modifyDraft('category', category)
  }

  function setIsHidden(isHidden: boolean) {
    modifyDraft('isHidden', isHidden)
  }

  function setThumbnail(thumbnail: string) {
    modifyDraft('thumbnail', thumbnail)
  }

  function setContent(content: string) {
    modifyDraft('content', content)
  }

  return { draft, setTitle, setCategory, setIsHidden, setThumbnail, setContent }
}

export const NewPostPage: FC = () => {
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loading: loadingCategories, data: categories } = useQuery(
    GET_POSTABLE_CATEGORIES
  )
  const [_createPost, { loading: creatingPost, reset: resetMutation }] =
    useMutation(CREATE_POST)

  const { draft, setCategory, setTitle, setContent, setIsHidden } = useDraft({
    title: '',
    category: Number(searchParams.get('category')) || 0,
    isHidden: false,
    content: ''
  })
  const [selectedCategory, setSelectedCategory] = useState<{
    id?: number
    isHidden: boolean
  }>({
    isHidden: false
  })

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

  return (
    <div className='size-full p-10'>
      <div className='flex size-full flex-col gap-3'>
        <div className='flex items-center gap-2'>
          <select
            className='w-36'
            disabled={loadingCategories}
            value={draft.category}
            onChange={(e) => setCategory(Number(e.target.value))}
          >
            <option value={0}>분류 미지정</option>
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
              <TooltipContent>
                비공개 게시판에 작성될 게시글입니다
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        <Tiptap
          className='min-h-40 grow'
          content={draft.content}
          onChange={(editor) => setContent(editor.getHTML())}
        />

        <ThemedButton
          className='h-10 w-full py-0.5 text-lg text-foreground'
          variant='flat'
          color='primary'
          disabled={!draft.title || creatingPost}
          onClick={() =>
            _createPost({
              variables: {
                data: {
                  ...draft,
                  isHidden: draft.isHidden || selectedCategory.isHidden
                }
              },
              refetchQueries: [
                { query: GET_POSTS, variables: { categoryId: draft.category } },
                {
                  query: GET_CATEGORY_INFO,
                  variables: { id: draft.category }
                },
                { query: GET_CATEGORIES }
              ],
              onCompleted: ({ createPost }) => {
                navigate(`/post/${createPost.createdPost.id}`)
              },
              onError: ({ clientErrors, graphQLErrors, networkError }) => {
                if (clientErrors.length || networkError)
                  alert('게시글 업로드 중 오류가 발생했습니다.')
                else if (graphQLErrors.length) {
                  alert('존재하지 않는 분류입니다')
                  setCategory(0)
                }
                resetMutation()
              }
            })
          }
        >
          {creatingPost ? <Spinner size='xs' /> : '게시'}
        </ThemedButton>
      </div>
    </div>
  )
}
