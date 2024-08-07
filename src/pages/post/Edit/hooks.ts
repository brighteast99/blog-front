import { useState } from 'react'
import { useDiffState } from 'hooks/useDiffState'

import { createSetter } from 'utils/stateSetter'

import type { PostInput } from './api'

export const usePostInput = (initialValue: PostInput) => {
  const {
    value: postInput,
    hasChange,
    setValue: setPostInput,
    initialize
  } = useDiffState<PostInput>(initialValue)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  function addImage(image: string) {
    setPostInput((prev) => ({ ...prev, images: [...prev.images, image] }))
  }

  function removeImage(image: string) {
    setPostInput((prev: PostInput) => {
      const idx = prev.images.findIndex((_image: string) => _image === image)
      if (idx === -1) return prev

      prev.images = prev.images.toSpliced(idx, 1)

      let copy = { ...prev }
      if (copy.thumbnail === image) delete copy.thumbnail

      return copy
    })
    setImagesToDelete((prev) => [...prev, image])
  }

  return {
    postInput,
    hasChange,
    imagesToDelete,
    initialize,
    setPostInput,
    setCategory: createSetter<number | undefined, PostInput>(
      setPostInput,
      'category'
    ),
    setTitle: createSetter<string, PostInput>(setPostInput, 'title'),
    setContent: createSetter<string, PostInput>(setPostInput, 'content'),
    setTextContent: createSetter<string, PostInput>(
      setPostInput,
      'textContent'
    ),
    setIsHidden: createSetter<boolean, PostInput>(setPostInput, 'isHidden'),
    setImages: createSetter<string[], PostInput>(setPostInput, 'images'),
    // Todo: test
    setThumbnail: createSetter<string | null, PostInput>(
      setPostInput,
      'thumbnail'
    ),
    addImage,
    removeImage
  }
}
