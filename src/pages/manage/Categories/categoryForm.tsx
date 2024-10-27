import { useEffect, useLayoutEffect, useMemo } from 'react'

import { useMutation, useQuery, useReadQuery } from '@apollo/client'
import {
  CATEGORY_FULL_INFO,
  GET_CATEGORY_HIERARCHY,
  UPDATE_CATEGORY,
  VALID_SUPERCATEGORIES
} from 'api/category'

import { useDialog } from 'hooks/useDialog'
import { useNavigationBlocker } from 'hooks/useNavigationBlocker'

import { ThemedButton } from 'components/Buttons/ThemedButton'
import { ImageInput } from 'components/Controls/ImageInput'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'
import { useCategoryInput } from './hooks'

import type { FC, FormEvent } from 'react'
import type { QueryRef } from '@apollo/client'
import type { CategoryInput } from 'api/category'
import type { Category } from 'types/data'

export const CategoryForm: FC<{
  queryRef: QueryRef<{ category: Category }, { id: number }>
}> = ({ queryRef }) => {
  const {
    categoryInput: { coverImage, name, description, subcategoryOf, isHidden },
    hasChange,
    initialize,
    setCoverImage,
    setName,
    setDescription,
    setSubcategoryOf,
    setIsHidden
  } = useCategoryInput({
    name: '',
    description: '',
    isHidden: false
  })

  const { block, unblock } = useNavigationBlocker()
  const showDialog = useDialog()

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

      initialize(categoryData)
    }
  }, [category, initialize])

  // * block navigation if there are some changes
  useLayoutEffect(() => {
    if (hasChange) block()
    else unblock()
  }, [hasChange, block, unblock])

  return (
    <form className='flex size-full flex-col gap-3' onSubmit={updateCategory}>
      <ImageInput
        key={category.id}
        menuPlacement='top'
        className='h-50 w-full'
        initialImage={category.coverImage}
        sizeLimit={3}
        placeholder={
          <span className='block size-fit select-none text-lg font-semibold text-neutral-400'>
            커버 이미지
          </span>
        }
        onInput={(file) => setCoverImage(file)}
      />

      <div className='flex gap-3'>
        <span className='text-neutral-700'>상위 분류</span>
        <select
          className='grow'
          value={subcategoryOf ?? 0}
          onChange={async (e) => {
            if (
              await showDialog(
                '현재 분류 및 하위 분류들이 모두 해당 분류 아래로 이동합니다.',
                'CONFIRM'
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
          placeholder={category.name}
          value={name}
          maxLength={100}
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
                onChange={async (e) => {
                  if (
                    e.target.checked &&
                    !(await showDialog(
                      '해당 분류와 하위 분류가 모두 숨겨집니다.',
                      'CONFIRM'
                    ))
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
        disabled={!hasChange}
        loading={updating}
        spinnerSize='xs'
      >
        저장
      </ThemedButton>
    </form>
  )
}
