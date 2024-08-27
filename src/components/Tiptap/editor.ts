import Details from '@tiptap-pro/extension-details'
import DetailsContent from '@tiptap-pro/extension-details-content'
import DetailsSummary from '@tiptap-pro/extension-details-summary'
import CharacterCount from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import ListKeymap from '@tiptap/extension-list-keymap'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Underline } from '@tiptap/extension-underline'
import { StarterKit } from '@tiptap/starter-kit'

import { BetterBlockquote } from 'components/Tiptap/extensions/BetterBlockquote'
import { Callout } from 'components/Tiptap/extensions/Callout'
import { BetterCodeBlock } from './extensions/BetterCodeblock'
import { BetterSubscript } from './extensions/BetterSubscript'
import { BetterSuperscript } from './extensions/BetterSuperscript'
import { FontSize } from './extensions/FontSize'
import { ResizableImage } from './extensions/ResizableImage'

/**
 * Todo: ToC?
 */

export const commonExtensions = (() => {
  const configuredColor = Color.configure({
    types: ['textStyle']
  })

  const configuredDetails = Details.configure({
    HTMLAttributes: {
      class: 'details'
    }
  })

  const configuredHighlight = Highlight.configure({
    multicolor: true
  })

  const configuredResizableImage = ResizableImage.configure({
    minWidth: 50,
    inline: true
  })

  const configuredTaskItem = TaskItem.configure({
    nested: true
  })

  const configuredTextAlign = TextAlign.configure({
    types: ['heading', 'paragraph'],
    defaultAlignment: 'justify'
  })

  const configuredLink = Link.configure({
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: '_blank'
    },
    validate: (href) => /^https?:\/\//.test(href)
  })

  return [
    BetterBlockquote,
    BetterCodeBlock,
    BetterSubscript,
    BetterSuperscript,
    Callout,
    CharacterCount,
    configuredColor,
    configuredDetails,
    configuredHighlight,
    configuredLink,
    configuredResizableImage,
    configuredTaskItem,
    configuredTextAlign,
    DetailsContent,
    DetailsSummary,
    FontSize,
    ListKeymap,
    TableCell,
    TableHeader,
    TableRow,
    TaskList,
    TextStyle,
    Underline
  ]
})()

export const viewerExtensions = (() => {
  const configuredStarterKit = StarterKit.configure({
    blockquote: false,
    codeBlock: false,
    dropcursor: false,
    gapcursor: false
  })

  const configuredTable = Table.configure({
    lastColumnResizable: false
  })

  return [configuredStarterKit, configuredTable]
})()

export const editorExtensions = (() => {
  const configuredStarterKit = StarterKit.configure({
    blockquote: false,
    codeBlock: false,
    dropcursor: {
      color:
        'hsl(var(--twc-primary) / var(--twc-primary-opacity, var(--tw-bg-opacity)))'
    }
  })

  const configuredTable = Table.configure({
    resizable: true,
    allowTableNodeSelection: true
  })

  return [configuredStarterKit, configuredTable]
})()
