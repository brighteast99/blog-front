import { useLayoutEffect } from 'react'

import { useAppSelector } from 'store/hooks'
import { selectBlogInfo } from 'store/slices/blog/blogSlice'

export const usePageMeta = () => {
  const { title, favicon } = useAppSelector(selectBlogInfo)

  // * Update title
  // Todo: Update title acording to current location
  useLayoutEffect(() => {
    document.title = title
  }, [title])

  // * Set favicon
  useLayoutEffect(() => {
    let link = document.querySelector("link[rel ~= 'icon']") as HTMLLinkElement

    if (favicon) {
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = favicon
    } else if (link) link.remove()
  }, [favicon])
}
