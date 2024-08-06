import { useCallback, useState } from 'react'

import { createSetter } from 'utils/stateSetter'

import type { CategoryInput } from './api'

export const useCategory = (_initialValue: CategoryInput) => {
  const [initialValue, setInitialValue] = useState<CategoryInput>(_initialValue)
  const [value, setValue] = useState<CategoryInput>(_initialValue)

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

  return {
    info: value,
    isModified,
    initialize,
    setCoverImage: createSetter<File | null | undefined, CategoryInput>(
      setValue,
      'coverImage'
    ),
    setName: createSetter<string, CategoryInput>(setValue, 'name'),
    setDescription: createSetter<string, CategoryInput>(
      setValue,
      'description'
    ),
    setSubcategoryOf: createSetter<number, CategoryInput>(
      setValue,
      'subcategoryOf'
    ),
    setIsHidden: createSetter<boolean, CategoryInput>(setValue, 'isHidden')
  }
}
