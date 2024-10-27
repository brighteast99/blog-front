import { useDiffState } from 'hooks/useDiffState'
import { createSetter } from 'utils/stateSetter'

import type { BlogInfoInput } from 'api/info'

export const useBlogInfoInput = (initialValue: BlogInfoInput) => {
  const {
    value: blogInfoInput,
    hasChange,
    setValue: setBlogInfoInput,
    initialize
  } = useDiffState<BlogInfoInput>(initialValue)

  return {
    blogInfoInput,
    hasChange,
    initialize,
    setBlogInfoInput,
    setTitle: createSetter<string, BlogInfoInput>(setBlogInfoInput, 'title'),
    setDescription: createSetter<string, BlogInfoInput>(
      setBlogInfoInput,
      'description'
    ),
    setAvatar: createSetter<File | null | undefined, BlogInfoInput>(
      setBlogInfoInput,
      'avatar'
    ),
    setFavicon: createSetter<File | null | undefined, BlogInfoInput>(
      setBlogInfoInput,
      'favicon'
    )
  }
}
