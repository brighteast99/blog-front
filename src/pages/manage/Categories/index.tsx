import { FC, Suspense, useCallback, useLayoutEffect } from 'react'
import {
  TypedDocumentNode,
  gql,
  useLoadableQuery,
  useMutation,
  useQuery
} from '@apollo/client'
import clsx from 'clsx'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Category } from 'types/data'
import { GET_CATEGORY_HIERARCHY } from 'features/sidebar/Sidebar'
import { GET_CATEGORY } from 'pages/category'
import Icon from '@mdi/react'
import { mdiLoading, mdiLock, mdiMinus, mdiPlus } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { Spinner } from 'components/Spinner'
import { CategoryForm, CategoryInput } from './categoryForm'

export const CREATE_CATEGORY: TypedDocumentNode<
  { createCategory: { createdCategory: Category } },
  { data: CategoryInput }
> = gql`
  mutation CreateCategory($data: CategoryInput!) {
    createCategory(data: $data) {
      createdCategory {
        id
      }
    }
  }
`

export const DELETE_CATEGORY: TypedDocumentNode<
  { deleteCategory: { success: boolean } },
  { id: number }
> = gql`
  mutation DeleteCategory($id: Int!) {
    deleteCategory(id: $id) {
      success
    }
  }
`

const CategoryListItem: FC<{ category: Category }> = ({ category }) => {
  const [searchParams, _] = useSearchParams()
  const active = searchParams.get('category') === category.id?.toString()

  return (
    <>
      <li
        className={
          active
            ? 'bg-primary bg-opacity-25 text-primary hover:brightness-125'
            : 'hover:bg-neutral-100'
        }
        style={{ paddingLeft: `calc(0.375rem + 1rem * ${category.level})` }}
      >
        <Link
          className={clsx(
            'block size-full px-1.5 py-1',
            active && 'pointer-events-none'
          )}
          to={`?category=${category.id}`}
          replace
        >
          {category.name}
          {category.isHidden && (
            <Icon className='ml-1 inline' path={mdiLock} size={0.5} />
          )}
        </Link>
      </li>
      {category.subcategories.length > 0 && (
        <ul>
          {category.subcategories.map((subcategory) => (
            <CategoryListItem key={subcategory.id} category={subcategory} />
          ))}
        </ul>
      )}
    </>
  )
}

export const ManageCategoryPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data, loading } = useQuery(GET_CATEGORY_HIERARCHY)
  const [loadCategory, queryRef, { reset }] = useLoadableQuery(GET_CATEGORY, {
    fetchPolicy: 'cache-and-network'
  })
  const [_createCategory, { loading: creating, reset: resetCreateMutation }] =
    useMutation(CREATE_CATEGORY)
  const [_deleteCategory, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_CATEGORY)
  const selectedCategory =
    Number.parseInt(searchParams.get('category') ?? '0') || undefined

  const categories = JSON.parse(
    JSON.parse(data?.categoryHierarchy ?? '"[]"')
  ) as Category[]

  const selectCategory = useCallback(
    (id?: number, forced?: boolean) => {
      if (forced) {
        if (id) searchParams.set('category', id.toString())
        else searchParams.delete('category')
        setSearchParams(searchParams, { replace: true })
        return
      }

      return navigate(id ? `?category=${id}` : '.', { replace: true })
    },
    [navigate, searchParams, setSearchParams]
  )

  const createCategory = useCallback(() => {
    _createCategory({
      variables: {
        data: {
          name: '새 분류',
          description: '',
          isHidden: Boolean(
            categories.find((category) => category.id === selectedCategory)
              ?.isHidden
          ),
          subcategoryOf: selectedCategory
        }
      },
      refetchQueries: [
        {
          query: GET_CATEGORY_HIERARCHY
        }
      ],
      onCompleted: ({ createCategory: { createdCategory } }) =>
        selectCategory(createdCategory.id),
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('분류 생성 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetCreateMutation()
      }
    })
  }, [
    _createCategory,
    categories,
    resetCreateMutation,
    selectCategory,
    selectedCategory
  ])

  const deleteCategory = useCallback(() => {
    if (!selectedCategory) return
    if (!window.confirm('해당 분류 및 하위 분류가 모두 삭제됩니다.')) return

    _deleteCategory({
      variables: {
        id: selectedCategory
      },
      refetchQueries: [
        {
          query: GET_CATEGORY_HIERARCHY
        }
      ],
      onCompleted: () => selectCategory(undefined, true),
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('분류 삭제 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetDeleteMutation()
      }
    })
  }, [_deleteCategory, resetDeleteMutation, selectCategory, selectedCategory])

  useLayoutEffect(() => {
    if (!selectedCategory) reset()
    else
      loadCategory({
        id: selectedCategory
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  return (
    <div className='flex gap-2 p-5 *:h-120'>
      <div className='w-1/3'>
        <div
          className='relative h-full overflow-y-auto rounded border border-neutral-200 bg-neutral-50 pb-10'
          onClick={(e) => {
            if (e.target !== e.currentTarget) return
            selectCategory(undefined)
          }}
        >
          {loading && <Spinner className='absolute inset-0' size='sm' />}
          {data && (
            <ul>
              {categories.map((category) => {
                if (!category.id) return null
                return (
                  <CategoryListItem key={category.id} category={category} />
                )
              })}
            </ul>
          )}
        </div>

        <div className='flex w-full justify-end'>
          <IconButton
            disabled={creating}
            path=''
            variant='hover-text'
            color='primary'
            iconProps={{
              spin: creating,
              path: creating ? mdiLoading : mdiPlus
            }}
            onClick={createCategory}
          />
          <IconButton
            disabled={!selectedCategory}
            path=''
            variant='hover-text'
            color='error'
            iconProps={{
              spin: deleting,
              path: deleting ? mdiLoading : mdiMinus
            }}
            onClick={deleteCategory}
          />
        </div>
      </div>

      <div className='relative w-2/3'>
        <Suspense fallback={<Spinner className='absolute inset-0' />}>
          {queryRef ? (
            <CategoryForm queryRef={queryRef} />
          ) : (
            <span className='absolute inset-0 m-auto block size-fit text-xl text-neutral-400'>
              편집할 분류를 선택하세요
            </span>
          )}
        </Suspense>
      </div>
    </div>
  )
}
