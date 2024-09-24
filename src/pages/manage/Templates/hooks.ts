import { useCallback } from 'react'

import { useDiffState } from 'hooks/useDiffState'
import { createSetter } from 'utils/stateSetter'

import type { PostInput } from 'pages/post/Edit/api'

interface TemplateInput extends Omit<PostInput, 'isHidden'> {
  templateName: string
}

export const useTemplateInput = (initialValue: TemplateInput) => {
  const {
    value: templateInput,
    hasChange,
    setValue: setTemplateInput,
    initialize
  } = useDiffState<TemplateInput>(initialValue)

  const addImage = useCallback(
    (image: string) =>
      setTemplateInput((prev) => ({
        ...prev,
        images: [...prev.images, image]
      })),
    [setTemplateInput]
  )

  const addImages = useCallback(
    (images: string[]) =>
      setTemplateInput((prev) => ({
        ...prev,
        images: [...prev.images, ...images]
      })),
    [setTemplateInput]
  )

  const removeImage = useCallback(
    (image: string) => {
      setTemplateInput((prev: TemplateInput) => {
        const idx = prev.images.findIndex((_image: string) => _image === image)
        if (idx === -1) return prev

        return {
          ...prev,
          images: prev.images.toSpliced(idx, 1),
          thumbnail: prev.thumbnail === image ? undefined : prev.thumbnail
        }
      })
    },
    [setTemplateInput]
  )

  return {
    templateInput,
    hasChange,
    initialize,
    setTemplateInput,
    setCategory: createSetter<number | undefined, TemplateInput>(
      setTemplateInput,
      'category'
    ),
    setTemplateName: createSetter<string, TemplateInput>(
      setTemplateInput,
      'templateName'
    ),
    setTitle: createSetter<string, TemplateInput>(setTemplateInput, 'title'),
    setContent: createSetter<string, TemplateInput>(
      setTemplateInput,
      'content'
    ),
    setTextContent: createSetter<string, TemplateInput>(
      setTemplateInput,
      'textContent'
    ),
    setImages: createSetter<string[], TemplateInput>(
      setTemplateInput,
      'images'
    ),
    setThumbnail: createSetter<string | null, TemplateInput>(
      setTemplateInput,
      'thumbnail'
    ),
    addImage,
    addImages,
    removeImage
  }
}
