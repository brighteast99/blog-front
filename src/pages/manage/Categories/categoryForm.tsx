import {
  QueryReference,
  TypedDocumentNode,
  gql,
  useMutation,
  useQuery,
  useReadQuery
} from '@apollo/client'
import { mdiClose, mdiRefresh } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'
import { GET_CATEGORIES } from 'features/sidebar/Sidebar'
import { GET_CATEGORY_INFO } from 'pages/category'
import { FC, FormEvent, useEffect, useRef, useState } from 'react'
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

export const useCategoryInfo = (initialValue: CategoryInput) => {
  const [info, setInfo] = useState<CategoryInput>(initialValue)
  const [coverPreview, setCoverPreview] = useState<string | null>()

  function setName(name: string) {
    setInfo((prev) => {
      return {
        ...prev,
        name
      }
    })
  }

  function setDescription(description: string) {
    setInfo((prev) => {
      return {
        ...prev,
        description
      }
    })
  }

  function setIsHidden(isHidden: boolean) {
    setInfo((prev) => {
      return {
        ...prev,
        isHidden
      }
    })
  }

  function setSubcategoryOf(subcategoryOf: number) {
    setInfo((prev) => {
      return {
        ...prev,
        subcategoryOf: subcategoryOf
      }
    })
  }

  function setCoverImage(coverImage?: File | null) {
    setInfo((prev) => {
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
    if (info.coverImage) {
      url = URL.createObjectURL(info.coverImage)
      setCoverPreview(url)
    } else setCoverPreview(null)

    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [info.coverImage])

  return {
    info,
    coverPreview,
    initialize: setInfo,
    setCoverImage,
    setName,
    setDescription,
    setSubcategoryOf,
    setIsHidden
  }
}

export const CategoryForm: FC<{
  queryRef: QueryReference<{ categoryInfo: Category }, { id: number }>
}> = ({ queryRef }) => {
  const ImageInput = useRef<HTMLInputElement>(null)
  const {
    data: { categoryInfo }
  } = useReadQuery(queryRef)
  const { data: categoriesData } = useQuery(GET_VALID_SUPERCATEGORIES, {
    variables: { id: categoryInfo.id as number },
    fetchPolicy: 'cache-and-network'
  })
  const [_updateCategory, { loading: updating, reset: resetUpdateMutation }] =
    useMutation(UPDATE_CATEGORY)
  const {
    info: { coverImage, name, description, subcategoryOf, isHidden },
    coverPreview,
    initialize,
    setCoverImage,
    setName,
    setDescription,
    setSubcategoryOf,
    setIsHidden
  } = useCategoryInfo({
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
    if (categoryInfo) {
      let categoryData: CategoryInput = {
        name: categoryInfo.name,
        description: categoryInfo.description,
        isHidden: categoryInfo.isHidden
      }
      if (categoryInfo.subcategoryOf?.id)
        categoryData.subcategoryOf = categoryInfo.subcategoryOf?.id

      initialize(categoryData)
    }
  }, [categoryInfo, initialize])

  function updateCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const id = categoryInfo.id as number
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
          query: GET_CATEGORIES
        },
        {
          query: GET_CATEGORY_INFO,
          variables: { id }
        }
      ],
      onError: () => {
        alert('분류 수정 중 오류가 발생했습니다.')
        resetUpdateMutation()
      }
    })
  }

  return (
    <form className='flex flex-col gap-3' onSubmit={updateCategory}>
      <div
        className='relative h-50 w-full bg-neutral-100 bg-cover bg-center'
        style={{
          backgroundImage:
            coverImage === null
              ? undefined
              : `url(${coverPreview ?? categoryInfo.coverImage})`
        }}
      >
        {!coverImage && !categoryInfo.coverImage && (
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
          {(coverImage || categoryInfo.coverImage) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  className='absolute right-0 top-0 !bg-transparent p-1'
                  path={
                    coverChanged && categoryInfo.coverImage
                      ? mdiRefresh
                      : mdiClose
                  }
                  variant='text'
                  type='button'
                  color={
                    coverChanged && categoryInfo.coverImage ? 'unset' : 'error'
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    setCoverImage(
                      coverChanged && categoryInfo.coverImage ? undefined : null
                    )
                    if (ImageInput.current) ImageInput.current.value = ''
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                {coverChanged && categoryInfo.coverImage
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
        <span className='text-neutral-700'>분류 이름</span>
        <input
          className='grow'
          type='text'
          required
          value={name}
          placeholder={categoryInfo.name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className='flex gap-3'>
        <span className='text-neutral-700'>분류 설명</span>
        <textarea
          className='min-h-20 grow p-2'
          value={description}
          placeholder={categoryInfo.description}
          onChange={(e) => setDescription(e.target.value)}
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
          {categoriesData?.validSupercategories.map((category) => {
            if (category.id === categoryInfo.id) return null
            return (
              <option
                key={category.id}
                value={category.id}
                data-hidden={category.isHidden || undefined}
              >
                {category.name}
              </option>
            )
          })}
        </select>
      </div>

      <label>
        <span className='text-neutral-700'>분류 숨김</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <input
              className='ml-3 accent-primary'
              type='checkbox'
              disabled={parentIsHidden}
              checked={isHidden || parentIsHidden}
              onChange={(e) => {
                if (
                  e.target.checked &&
                  !window.confirm('해당 분류와 하위 분류가 모두 숨겨집니다.')
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
      </label>

      <ThemedButton className='h-10 w-full py-0.5 text-lg' color='primary'>
        {updating ? <Spinner size='xs' /> : '저장'}
      </ThemedButton>
    </form>
  )
}
