import { useCallback } from 'react'

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

  const addImage = useCallback(
    (image: string) =>
      setPostInput((prev) => ({ ...prev, images: [...prev.images, image] })),
    [setPostInput]
  )

  const addImages = useCallback(
    (images: string[]) =>
      setPostInput((prev) => ({
        ...prev,
        images: [...prev.images, ...images]
      })),
    [setPostInput]
  )

  const removeImage = useCallback(
    (image: string) => {
      setPostInput((prev: PostInput) => {
        const idx = prev.images.findIndex((_image: string) => _image === image)
        if (idx === -1) return prev

        return {
          ...prev,
          images: prev.images.toSpliced(idx, 1),
          thumbnail: prev.thumbnail === image ? undefined : prev.thumbnail
        }
      })
    },
    [setPostInput]
  )

  return {
    postInput,
    hasChange,
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
    setThumbnail: createSetter<string | null, PostInput>(
      setPostInput,
      'thumbnail'
    ),
    addImage,
    addImages,
    removeImage
  }
}
