import {
  FC,
  Suspense,
  createContext,
  useCallback,
  useContext,
  useState
} from 'react'
import {
  TypedDocumentNode,
  gql,
  useLoadableQuery,
  useMutation,
  useQuery
} from '@apollo/client'
import { mdiLoading, mdiLock, mdiMinus, mdiPlus } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { GET_CATEGORIES } from 'features/sidebar/Sidebar'
import { Spinner } from 'components/Spinner'
import { Category } from 'types/data'
import clsx from 'clsx'
import Icon from '@mdi/react'
import { GET_CATEGORY_INFO } from 'pages/category'
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

const ListStateContext = createContext<number | undefined>(undefined)
const ListActionContext = createContext((_id?: number) => {})

const CategoryListItem: FC<{ category: Category }> = ({ category }) => {
  const listState = useContext(ListStateContext)
  const select = useContext(ListActionContext)

  return (
    <>
      <li
        className={clsx(
          'cursor-pointer px-1.5 py-1 hover:bg-neutral-100',
          listState === category.id &&
            'hover:bg-brightness-100 !bg-primary text-background'
        )}
        onClick={() => select(category.id)}
      >
        {category.name}
        {category.isHidden && (
          <Icon className='ml-1 inline' path={mdiLock} size={0.5} />
        )}
      </li>
      {category.subcategories.length > 0 && (
        <ul className='pl-2'>
          {category.subcategories.map((subcategory) => (
            <CategoryListItem key={subcategory.id} category={subcategory} />
          ))}
        </ul>
      )}
    </>
  )
}

export const ManageCategoryPage: FC = () => {
  const { data, loading } = useQuery(GET_CATEGORIES)
  const [loadCategoryInfo, queryRef, { reset }] = useLoadableQuery(
    GET_CATEGORY_INFO,
    { fetchPolicy: 'cache-and-network' }
  )
  const [selectedCategory, setSelectedCategory] = useState<number>()
  const [_createCategory, { loading: creating, reset: resetCreateMutation }] =
    useMutation(CREATE_CATEGORY)
  const [_deleteCategory, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_CATEGORY)

  const selectCategory = useCallback(
    (id?: number) => {
      if (!id) {
        setSelectedCategory(undefined)
        reset()
        return
      }

      setSelectedCategory(id)
      loadCategoryInfo({
        id
      })
    },
    [loadCategoryInfo, reset]
  )

  const createCategory = useCallback(() => {
    _createCategory({
      variables: {
        data: {
          name: '새 분류',
          description: '',
          isHidden: false
        }
      },
      refetchQueries: [
        {
          query: GET_CATEGORIES
        }
      ],
      onError: () => {
        alert('분류 생성 중 오류가 발생했습니다.')
        resetCreateMutation()
      }
    })
  }, [_createCategory, resetCreateMutation])

  const deleteCategory = useCallback(() => {
    if (!selectedCategory) return
    if (!window.confirm('해당 분류 및 하위 분류가 모두 삭제됩니다.')) return

    _deleteCategory({
      variables: {
        id: selectedCategory
      },
      refetchQueries: [
        {
          query: GET_CATEGORIES
        }
      ],
      onCompleted: () => setSelectedCategory(undefined),
      onError: () => {
        alert('분류 삭제 중 문제가 발생했습니다.')
        resetDeleteMutation()
      }
    })
  }, [_deleteCategory, resetDeleteMutation, selectedCategory])

  return (
    <div className='flex h-[31rem] gap-2 p-5'>
      <div className='w-1/3'>
        <div className='relative h-full overflow-y-auto rounded border border-neutral-200 bg-neutral-50'>
          {loading && <Spinner className='absolute inset-0' size='sm' />}
          {data && (
            <ListStateContext.Provider value={selectedCategory}>
              <ListActionContext.Provider value={selectCategory}>
                <ul>
                  {(
                    JSON.parse(JSON.parse(data.categoryList)) as Category[]
                  ).map((category) => {
                    if (!category.id) return null
                    return (
                      <CategoryListItem key={category.id} category={category} />
                    )
                  })}
                </ul>
              </ListActionContext.Provider>
            </ListStateContext.Provider>
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

      <div className='w-2/3'>
        <div className='relative size-full'>
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
    </div>
  )
}
