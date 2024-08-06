import { useCallback, useState } from 'react'

import { BlogInfoInput } from './api'

import { createSetter } from 'utils/stateSetter'

export const useBlogInfo = (_initialValue: BlogInfoInput) => {
  const [initialValue, setInitialValue] = useState<BlogInfoInput>(_initialValue)
  const [value, setValue] = useState<BlogInfoInput>(_initialValue)

  const isModified = JSON.stringify(initialValue) !== JSON.stringify(value)

  const initialize = useCallback(
    (
      value: BlogInfoInput | ((prev: BlogInfoInput) => BlogInfoInput),
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
    setTitle: createSetter<string, BlogInfoInput>(setValue, 'title'),
    setDescription: createSetter<string, BlogInfoInput>(
      setValue,
      'description'
    ),
    setAvatar: createSetter<File | null | undefined, BlogInfoInput>(
      setValue,
      'avatar'
    )
  }
}
