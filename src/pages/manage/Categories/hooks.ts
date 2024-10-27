import { useDiffState } from 'hooks/useDiffState'
import { createSetter } from 'utils/stateSetter'

import type { CategoryInput } from 'api/category'

export const useCategoryInput = (initialValue: CategoryInput) => {
  const {
    value: categoryInput,
    hasChange,
    setValue: setCategoryInput,
    initialize
  } = useDiffState<CategoryInput>(initialValue)

  return {
    categoryInput,
    hasChange,
    initialize,
    setCategoryInput,
    setCoverImage: createSetter<File | null | undefined, CategoryInput>(
      setCategoryInput,
      'coverImage'
    ),
    setName: createSetter<string, CategoryInput>(setCategoryInput, 'name'),
    setDescription: createSetter<string, CategoryInput>(
      setCategoryInput,
      'description'
    ),
    setSubcategoryOf: createSetter<number, CategoryInput>(
      setCategoryInput,
      'subcategoryOf'
    ),
    setIsHidden: createSetter<boolean, CategoryInput>(
      setCategoryInput,
      'isHidden'
    )
  }
}
