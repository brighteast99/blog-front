import { useCallback, useEffect, useState } from 'react'

import { createSetter } from 'utils/stateSetter'

import type { CategoryInput } from './api'

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
