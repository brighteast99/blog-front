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

  const configuredHighlight = Highlight.configure({
    multicolor: true
  })

  const configuredTextAlign = TextAlign.configure({
    types: ['heading', 'paragraph'],
    defaultAlignment: 'justify'
  })

  const configuredResizableImage = ResizableImage.configure({
    minWidth: 50,
    inline: true
  })

  const configuredTaskItem = TaskItem.configure({
    nested: true
  })

  const configuredDetails = Details.configure({
    HTMLAttributes: {
      class: 'details'
    }
  })

  return [
    BetterCodeBlock,
    BetterSubscript,
    BetterSuperscript,
    CharacterCount,
    configuredColor,
    configuredDetails,
    configuredHighlight,
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
    codeBlock: false,
    dropcursor: false,
    gapcursor: false
  })

  const configuredLink = Link.configure({
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: '_blank'
    },
    openOnClick: false,
    validate: (href) => /^https?:\/\//.test(href)
  })

  const configuredTable = Table.configure({
    lastColumnResizable: false
  })

  return [configuredLink, configuredStarterKit, configuredTable]
})()

export const editorExtensions = (() => {
  const configuredStarterKit = StarterKit.configure({
    codeBlock: false
  })

  const configuredLink = Link.configure({
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: '_blank'
    },
    validate: (href) => /^https?:\/\//.test(href)
  })

  const configuredTable = Table.configure({
    resizable: true,
    allowTableNodeSelection: true
  })

  return [configuredLink, configuredStarterKit, configuredTable]
})()
