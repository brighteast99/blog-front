import { FC, FormEvent, useCallback, useEffect, useRef, useState } from 'react'

import {
  QueryReference,
  TypedDocumentNode,
  gql,
  useMutation,
  useQuery,
  useReadQuery
} from '@apollo/client'
import { mdiClose, mdiRefresh } from '@mdi/js'

import { GET_CATEGORY_HIERARCHY } from 'features/sidebar/Sidebar'

import { GET_CATEGORY } from 'pages/category'

import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { NavigationBlocker } from 'components/NavigationBlocker'
import { Spinner } from 'components/Spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'

import { Category } from 'types/data'

export interface CategoryInput {
  coverImage?: File | null
  name: string
  description: string
  subcategoryOf?: number
  isHidden: boolean
}

const GET_VALID_SUPERCATEGORIES: TypedDocumentNode<
  { validSupercategories: Category[] },
  { id: number }
> = gql`
  query ValidSupercategories($id: Int!) {
    validSupercategories(id: $id) {
      id
      name
      isHidden
    }
  }
`
const UPDATE_CATEGORY: TypedDocumentNode<
  { updateCategory: { success: boolean } },
  { id: number; data: CategoryInput }
> = gql`
  mutation UpdateCategory($id: Int!, $data: CategoryInput!) {
    updateCategory(id: $id, data: $data) {
      success
    }
  }
`

export const useCategory = (_initialValue: CategoryInput) => {
  const [initialValue, setInitialValue] = useState<CategoryInput>(_initialValue)
  const [value, setValue] = useState<CategoryInput>(_initialValue)
  const [coverPreview, setCoverPreview] = useState<string | null>()

  const isModified = JSON.stringify(initialValue) !== JSON.stringify(value)

  const initialize = useCallback(
    (
      value: CategoryInput | ((prev: CategoryInput) => CategoryInput),
      keepInitialValue: boolean = false
    ) => {
      if (!keepInitialValue) setInitialValue(value)
      setValue(value)
    },
    [setInitialValue, setValue]
  )

  function setName(name: string) {
    setValue((prev) => {
      return {
        ...prev,
        name
      }
    })
  }

  function setDescription(description: string) {
    setValue((prev) => {
      return {
        ...prev,
        description
      }
    })
  }

  function setIsHidden(isHidden: boolean) {
    setValue((prev) => {
      return {
        ...prev,
        isHidden
      }
    })
  }

  function setSubcategoryOf(subcategoryOf: number) {
    setValue((prev) => {
      return {
        ...prev,
        subcategoryOf: subcategoryOf
      }
    })
  }

  function setCoverImage(coverImage?: File | null) {
    setValue((prev) => {
      if (coverImage === undefined) {
        let copy = { ...prev }
        delete copy.coverImage
        return copy
      }

      return {
        ...prev,
        coverImage
      }
    })
  }

  useEffect(() => {
    let url: string
    if (value.coverImage) {
      url = URL.createObjectURL(value.coverImage)
      setCoverPreview(url)
    } else setCoverPreview(null)

    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [value.coverImage])

  return {
    info: value,
    isModified,
    coverPreview,
    initialize,
    setCoverImage,
    setName,
    setDescription,
    setSubcategoryOf,
    setIsHidden
  }
}

export const CategoryForm: FC<{
  queryRef: QueryReference<{ category: Category }, { id: number }>
}> = ({ queryRef }) => {
  const ImageInput = useRef<HTMLInputElement>(null)
  const {
    data: { category }
  } = useReadQuery(queryRef)
  const { data: categoriesData } = useQuery(GET_VALID_SUPERCATEGORIES, {
    variables: { id: category.id as number },
    fetchPolicy: 'cache-and-network'
  })
  const [_updateCategory, { loading: updating, reset: resetUpdateMutation }] =
    useMutation(UPDATE_CATEGORY)
  const {
    info: { coverImage, name, description, subcategoryOf, isHidden },
    isModified,
    coverPreview,
    initialize,
    setCoverImage,
    setName,
    setDescription,
    setSubcategoryOf,
    setIsHidden
  } = useCategory({
    name: '',
    description: '',
    isHidden: false
  })

  const coverChanged = coverImage || coverImage === null

  const parentIsHidden =
    categoriesData?.validSupercategories.find(
      (category) => category.id === subcategoryOf
    )?.isHidden ?? false

  useEffect(() => {
    if (category) {
      let categoryData: CategoryInput = {
        name: category.name,
        description: category.description,
        isHidden: category.isHidden
      }
      if (category.subcategoryOf?.id)
        categoryData.subcategoryOf = category.subcategoryOf?.id

      initialize(categoryData, false)
    }
  }, [category, initialize])

  function updateCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const id = category.id as number
    _updateCategory({
      variables: {
        id,
        data: {
          coverImage,
          name,
          description,
          isHidden: isHidden || parentIsHidden,
          subcategoryOf: subcategoryOf || undefined
        }
      },
      refetchQueries: [
        {
          query: GET_CATEGORY_HIERARCHY
        },
        {
          query: GET_CATEGORY,
          variables: { id }
        }
      ],
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('분류 수정 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetUpdateMutation()
      }
    })
  }

  return (
    <>
      <NavigationBlocker
        enabled={isModified}
        localAlert
        message={'변경점이 있습니다.\n계속하시겠습니까?'}
      />
      <form className='flex size-full flex-col gap-3' onSubmit={updateCategory}>
        <div
          className='relative h-50 w-full bg-neutral-100 bg-cover bg-center'
          style={{
            backgroundImage:
              coverImage === null
                ? undefined
                : `url(${coverPreview ?? category.coverImage})`
          }}
        >
          {!coverImage && !category.coverImage && (
            <span className='absolute inset-0 z-0 m-auto block size-fit select-none text-lg font-semibold text-neutral-400'>
              커버 이미지
            </span>
          )}
          <div
            className='absolute flex size-full cursor-pointer flex-col items-center justify-center bg-background bg-opacity-80 transition-colors [&:not(:hover)]:opacity-0'
            onClick={() => {
              ImageInput.current?.click()
            }}
          >
            <span className='block text-xl text-foreground'>변경</span>
            {(coverImage || category.coverImage) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconButton
                    className='absolute right-0 top-0 !bg-transparent p-1'
                    path={
                      coverChanged && category.coverImage
                        ? mdiRefresh
                        : mdiClose
                    }
                    variant='text'
                    type='button'
                    color={
                      coverChanged && category.coverImage ? 'unset' : 'error'
                    }
                    onClick={(e) => {
                      e.stopPropagation()
                      setCoverImage(
                        coverChanged && category.coverImage ? undefined : null
                      )
                      if (ImageInput.current) ImageInput.current.value = ''
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {coverChanged && category.coverImage
                    ? '되돌리기'
                    : '기본 이미지로 변경'}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <input
            ref={ImageInput}
            type='file'
            className='invisible absolute'
            accept='image/*'
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return setCoverImage(null)

              // Maximum file size 3MB
              if (file.size > 1024 * 1024 * 3)
                return alert(
                  `파일 크기는 3MB를 넘을 수 없습니다.\n선택한 파일 크기: ${Math.round((file.size / 1024 / 1024) * 10) / 10}MB`
                )

              setCoverImage(file)
            }}
          />
        </div>

        <div className='flex gap-3'>
          <span className='text-neutral-700'>상위 분류</span>
          <select
            className='grow'
            value={subcategoryOf ?? 0}
            onChange={(e) => {
              if (
                window.confirm(
                  '현재 분류 및 하위 분류들이 모두 해당 분류 아래로 이동합니다.'
                )
              ) {
                setSubcategoryOf(Number(e.target.value))
                if (e.target.selectedOptions[0].dataset.isHidden)
                  setIsHidden(true)
              }
            }}
          >
            <option value={0}>선택안함</option>
            {categoriesData?.validSupercategories.map((_category) => {
              if (_category.id === category.id) return null
              return (
                <option
                  key={_category.id}
                  value={_category.id}
                  data-hidden={_category.isHidden || undefined}
                >
                  {_category.name} {_category.isHidden && '(비공개)'}
                </option>
              )
            })}
          </select>
        </div>

        <div className='flex gap-3'>
          <span className='text-neutral-700'>분류 이름</span>
          <input
            className='grow'
            type='text'
            required
            value={name}
            placeholder={category.name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>
            <Tooltip>
              <TooltipTrigger asChild>
                <input
                  className='mr-2 accent-primary'
                  type='checkbox'
                  disabled={parentIsHidden}
                  checked={isHidden || parentIsHidden}
                  onChange={(e) => {
                    if (
                      e.target.checked &&
                      !window.confirm(
                        '해당 분류와 하위 분류가 모두 숨겨집니다.'
                      )
                    ) {
                      return e.preventDefault()
                    }
                    setIsHidden(e.target.checked)
                  }}
                />
              </TooltipTrigger>
              {parentIsHidden && (
                <TooltipContent>상위 분류가 숨겨진 분류입니다</TooltipContent>
              )}
            </Tooltip>
            <span className='text-neutral-700'>분류 숨기기</span>
          </label>
        </div>

        <div className='flex grow gap-3'>
          <span className='text-neutral-700'>분류 설명</span>
          <textarea
            className='min-h-20 grow p-2'
            value={description}
            placeholder={category.description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <ThemedButton className='h-10 w-full py-0.5 text-lg' color='primary'>
          {updating ? <Spinner size='xs' /> : '저장'}
        </ThemedButton>
      </form>
    </>
  )
}
