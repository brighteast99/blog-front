import Blockquote from '@tiptap/extension-blockquote'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { BetterBlockquoteNodeView } from '../nodeViews/BetterBlockquoteNodeView'

export const BetterBlockquote = Blockquote.extend({
  parseHTML() {
    return [
      {
        tag: 'blockquote:not([data-type])'
      }
    ]
  },
  addNodeView() {
    return ReactNodeViewRenderer(BetterBlockquoteNodeView)
  }
})
