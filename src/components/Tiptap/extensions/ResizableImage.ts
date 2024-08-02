import TipTapImage from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { ResizableImageNodeView } from '../nodeViews/ResizableImageNodeView'

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
      handleColor: 'primary',
      inline: false
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView)
  }
}).configure()
