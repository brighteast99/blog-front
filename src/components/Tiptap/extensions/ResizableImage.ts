import TipTapImage from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { ResizableImageNodeView } from '../nodeViews/ResizableImageNodeView'

declare module '@tiptap/extension-image' {
  interface ImageOptions {
    minWidth: number
  }
}

export const ResizableImage = TipTapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { renderHTML: ({ width }) => ({ width }) },
      height: { renderHTML: ({ height }) => ({ height }) }
    }
  },
  addOptions() {
    return {
      ...this.parent?.(),
      minWidth: 0,
      inline: false
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView)
  }
}).configure()
