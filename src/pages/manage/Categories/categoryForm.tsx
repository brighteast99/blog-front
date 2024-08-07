import { useEffect, useMemo } from 'react'

import { useMutation, useQuery, useReadQuery } from '@apollo/client'
import {
  CATEGORY_FULL_INFO,
  CategoryInput,
  GET_CATEGORY_HIERARCHY,
  UPDATE_CATEGORY,
  VALID_SUPERCATEGORIES
} from './api'

import { ThemedButton } from 'components/Buttons/ThemedButton'
import { ImageInput } from 'components/ImageInput'
import { Spinner } from 'components/Spinner'
import { NavigationBlocker } from 'components/utils/NavigationBlocker'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'
import { useCategory } from './hooks'

import type { FC, FormEvent } from 'react'
import type { QueryRef } from '@apollo/client'
import type { Category } from 'types/data'

export const CategoryForm: FC<{
  queryRef: QueryRef<{ category: Category }, { id: number }>
}> = ({ queryRef }) => {
  const {
    info: { coverImage, name, description, subcategoryOf, isHidden },
    isModified,
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

  const {
    data: { category }
  } = useReadQuery(queryRef)

  const { data: validSupercategoriesData } = useQuery(VALID_SUPERCATEGORIES, {
    variables: { id: category.id as number },
    fetchPolicy: 'cache-and-network'
  })
  const validSupercategories = useMemo(
    () => validSupercategoriesData?.validSupercategories || [],
    [validSupercategoriesData]
  )

  const [_updateCategory, { loading: updating, reset: resetUpdateMutation }] =
    useMutation(UPDATE_CATEGORY)

  const parentIsHidden = useMemo(
    () =>
      validSupercategories.find((category) => category.id === subcategoryOf)
        ?.isHidden ?? false,
    [validSupercategories, subcategoryOf]
  )

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
        { query: GET_CATEGORY_HIERARCHY },
        { query: CATEGORY_FULL_INFO, variables: { id } }
      ],
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('분류 수정 중 오류가 발생했습니다.')
        if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetUpdateMutation()
      }
    })
  }

  useEffect(() => {
    if (category) {
      let categoryData: CategoryInput = {
        coverImage: undefined,
        name: category.name,
        description: category.description,
        isHidden: category.isHidden
      }
      if (category.subcategoryOf?.id)
        categoryData.subcategoryOf = category.subcategoryOf?.id

      initialize(categoryData, false)
    }
  }, [category, initialize])

  return (
    <>
      <NavigationBlocker
        enabled={isModified}
        localAlert
        message={'변경점이 있습니다.\n계속하시겠습니까?'}
      />
      <form className='flex size-full flex-col gap-3' onSubmit={updateCategory}>
        <ImageInput
          key={category.id}
          initialImage={category.coverImage}
          sizeLimit={3}
          onInput={(file) => setCoverImage(file)}
          Viewer={
            <div className='relative h-50 w-full bg-neutral-100 bg-cover bg-center' />
          }
        />
        {/* <div
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
        </div> */}

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
            {validSupercategories.map((_category) => {
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

        <ThemedButton
          className='h-10 w-full py-0.5 text-lg'
          color='primary'
          disabled={updating || !isModified}
        >
          {updating ? <Spinner size='xs' /> : '저장'}
        </ThemedButton>
      </form>
    </>
  )
}
