import { useCallback, useState } from 'react'

import { createSetter } from 'utils/stateSetter'

import type { PostInput } from './api'

export const usePostInput = (_initialValue: PostInput) => {
  const [initialValue, setInitialValue] = useState<PostInput>(_initialValue)
  const [value, setValue] = useState<PostInput>(_initialValue)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const isModified = JSON.stringify(initialValue) !== JSON.stringify(value)

  const initialize = useCallback(
    (
      value: PostInput | ((prev: PostInput) => PostInput),
      keepInitialValue: boolean = false
    ) => {
      if (!keepInitialValue) setInitialValue(value)
      setValue(value)
    },
    [setInitialValue, setValue]
  )

  function addImage(image: string) {
    setValue((prev) => ({ ...prev, images: [...prev.images, image] }))
  }

  function removeImage(image: string) {
    setValue((prev) => {
      const idx = prev.images.findIndex((_image) => _image === image)
      if (idx === -1) return prev

      prev.images = prev.images.toSpliced(idx, 1)

      let copy = { ...prev }
      if (copy.thumbnail === image) delete copy.thumbnail

      return copy
    })
    setImagesToDelete((prev) => [...prev, image])
  }

  return {
    input: value,
    isModified,
    imagesToDelete,
    initialize,
    setCategory: createSetter<number | undefined, PostInput>(
      setValue,
      'category'
    ),
    setTitle: createSetter<string, PostInput>(setValue, 'title'),
    setContent: createSetter<string, PostInput>(setValue, 'content'),
    setTextContent: createSetter<string, PostInput>(setValue, 'textContent'),
    setIsHidden: createSetter<boolean, PostInput>(setValue, 'isHidden'),
    setImages: createSetter<string[], PostInput>(setValue, 'images'),
    // Todo: test
    setThumbnail: createSetter<string | null, PostInput>(setValue, 'thumbnail'),
    addImage,
    removeImage
  }
}
