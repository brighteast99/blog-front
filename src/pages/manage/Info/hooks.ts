import { useCallback, useEffect, useState } from 'react'

import { BlogInfoInput } from './api'

import { createSetter } from 'utils/stateSetter'

export const useBlogInfo = (_initialValue: BlogInfoInput) => {
  const [initialValue, setInitialValue] = useState<BlogInfoInput>(_initialValue)
  const [value, setValue] = useState<BlogInfoInput>(_initialValue)
  const [avatarPreview, setAvatarPreview] = useState<string | null>()

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

  function setAvatar(avatar?: File | null) {
    setValue((prev) => {
      if (avatar === undefined) {
        return {
          title: prev.title,
          description: prev.description
        }
      }

      return {
        ...prev,
        avatar
      }
    })
  }

  useEffect(() => {
    let url: string
    if (value.avatar) {
      url = URL.createObjectURL(value.avatar)
      setAvatarPreview(url)
    } else setAvatarPreview(null)

    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [value.avatar])

  return {
    info: value,
    isModified,
    avatarPreview,
    initialize,
    setTitle: createSetter<string, BlogInfoInput>(setValue, 'title'),
    setDescription: createSetter<string, BlogInfoInput>(
      setValue,
      'description'
    ),
    setAvatar
  }
}
