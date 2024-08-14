import { Node } from '@tiptap/core'
import { mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react'

import { CalloutNodeView } from '../nodeViews/CalloutNodeView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    Callout: {
      setCallout: (attributes?: { type?: CalloutType }) => ReturnType
      unsetCallout: () => ReturnType
      toggleCallout: (attributes?: { type?: CalloutType }) => ReturnType
    }
  }
}

export const CalloutTypes = [
  'note',
  'info',
  'success',
  'question',
  'warning',
  'error'
] as const
export type CalloutType = (typeof CalloutTypes)[number]

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block*',
  defining: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: 'note',
        parseHTML: (element) => element.getAttribute('data-type') || 'note',
        renderHTML: (attributes) => {
          if (attributes.type) {
            return { 'data-type': attributes.type }
          }
          return {}
        }
      }
    }
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setCallout:
        (attributes) =>
        ({ editor, commands }) => {
          if (editor.isActive('callout'))
            return commands.updateAttributes('callout', { ...attributes })
          else return commands.wrapIn('callout', attributes)
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift('callout')
        },
      toggleCallout:
        (attributes) =>
        ({ editor, commands }) => {
          if (editor.isActive('callout')) return commands.unsetCallout()
          return commands.setCallout(attributes)
        }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'blockquote[data-type]'
      }
    ]
  },

  renderHTML({ node }) {
    return [
      'blockquote',
      mergeAttributes({
        'data-type': node.attrs.type
      }),
      0
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView)
  }
})
