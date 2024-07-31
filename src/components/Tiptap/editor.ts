import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'

import { FontSize } from './extensions/fontSize'
import { lowlight } from './extensions/lowlight'
import { BetterCodeBlock } from './nodes/BetterCodeblock'
import { ResizableImage } from './nodes/ResizableImage'

export function getExtensions(editable: boolean) {
  return [
    StarterKit.configure({
      codeBlock: false,
      dropcursor: editable ? undefined : false,
      gapcursor: editable ? undefined : false
    }),
    FontSize,
    Underline,
    TextStyle,
    Superscript,
    Subscript,
    Color.configure({
      types: ['textStyle']
    }),
    Highlight.configure({
      multicolor: true
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      defaultAlignment: 'justify'
    }),
    Link.configure({
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank'
      },
      openOnClick: editable,
      validate: (href) => /^https?:\/\//.test(href)
    }),
    ResizableImage,
    BetterCodeBlock.configure({
      lowlight
    }),
    TaskList,
    TaskItem.configure({
      nested: true
    })
  ]
}
