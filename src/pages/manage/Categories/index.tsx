import { Suspense, useCallback, useLayoutEffect, useMemo } from 'react'
import clsx from 'clsx'
import { ErrorBoundary } from 'react-error-boundary'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useLoadableQuery, useMutation, useQuery } from '@apollo/client'
import {
  CATEGORY_FULL_INFO,
  CREATE_CATEGORY,
  DELETE_CATEGORY,
  GET_CATEGORY_HIERARCHY
} from './api'

import Icon from '@mdi/react'
import { mdiLoading, mdiLock, mdiMinus, mdiPlus } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { Error } from 'components/Error'
import { Spinner } from 'components/Spinner'
import { CategoryForm } from './categoryForm'

import type { FC } from 'react'
import type { Category } from 'types/data'

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

  const {
    data: categoriesData,
    loading: loadingCategories,
    error: errorLoadingCategories,
    refetch: refetchCategories
  } = useQuery(GET_CATEGORY_HIERARCHY, {
    notifyOnNetworkStatusChange: true
  })
  const categories = useMemo(() => {
    if (!categoriesData?.categoryHierarchy) return null

    try {
      return JSON.parse(
        JSON.parse(categoriesData?.categoryHierarchy)
      ) as Category[]
    } catch {
      return []
    }
  }, [categoriesData?.categoryHierarchy])

  const [
    loadCategory,
    queryRef,
    { reset: resetCategory, refetch: refetchCategory }
  ] = useLoadableQuery(CATEGORY_FULL_INFO)

  const [_createCategory, { loading: creating, reset: resetCreateMutation }] =
    useMutation(CREATE_CATEGORY)
  const [_deleteCategory, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_CATEGORY)
  const selectedCategory =
    Number.parseInt(searchParams.get('category') ?? '0') || undefined

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

  const createCategory = useCallback(
    () =>
      _createCategory({
        variables: {
          data: {
            name: '새 분류',
            description: '',
            isHidden: Boolean(
              categories?.find((category) => category.id === selectedCategory)
                ?.isHidden
            ),
            subcategoryOf: selectedCategory
          }
        },
        refetchQueries: [{ query: GET_CATEGORY_HIERARCHY }],
        onCompleted: ({ createCategory: { createdCategory } }) =>
          selectCategory(createdCategory.id),
        onError: ({ networkError, graphQLErrors }) => {
          if (networkError) alert('분류 생성 중 오류가 발생했습니다.')
          else if (graphQLErrors.length) alert(graphQLErrors[0].message)
          resetCreateMutation()
        }
      }),
    [
      _createCategory,
      categories,
      resetCreateMutation,
      selectCategory,
      selectedCategory
    ]
  )

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
    if (!selectedCategory) resetCategory()
    else
      loadCategory({
        id: selectedCategory
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  return (
    <div className='flex gap-2 p-5'>
      <div className='w-1/3'>
        <div
          className='relative h-full overflow-y-auto rounded border border-neutral-200 bg-neutral-50 pb-10'
          onClick={(e) => {
            if (e.target !== e.currentTarget) return
            selectCategory(undefined)
          }}
        >
          {loadingCategories && (
            <Spinner className='absolute inset-0' size='sm' />
          )}
          {errorLoadingCategories && (
            <Error
              code={500}
              hideDefaultAction
              actions={[{ label: '다시 시도', handler: refetchCategories }]}
            />
          )}
          {categories && (
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
            path={creating ? mdiLoading : mdiPlus}
            variant='hover-text'
            color='primary'
            iconProps={{ spin: creating }}
            onClick={createCategory}
          />
          <IconButton
            disabled={!selectedCategory}
            path={deleting ? mdiLoading : mdiMinus}
            variant='hover-text'
            color='error'
            iconProps={{ spin: deleting }}
            onClick={deleteCategory}
          />
        </div>
      </div>

      <div className='relative w-2/3'>
        <ErrorBoundary
          FallbackComponent={({ resetErrorBoundary }) => (
            <Error
              message='게시판 정보를 불러오지 못했습니다'
              hideDefaultAction
              actions={[
                {
                  label: '다시 시도',
                  handler: () => {
                    refetchCategory()
                    resetErrorBoundary()
                  }
                }
              ]}
            />
          )}
        >
          <Suspense fallback={<Spinner className='absolute inset-0' />}>
            {queryRef ? (
              <CategoryForm queryRef={queryRef} />
            ) : (
              <span className='absolute inset-0 m-auto block size-fit text-xl text-neutral-400'>
                편집할 분류를 선택하세요
              </span>
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
