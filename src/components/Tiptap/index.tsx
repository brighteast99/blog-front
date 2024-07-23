import { FC, useEffect, useLayoutEffect, useState } from 'react'
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
import { Editor, EditorProvider } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import django from 'highlight.js/lib/languages/django'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import nginx from 'highlight.js/lib/languages/nginx'
import pgsql from 'highlight.js/lib/languages/pgsql'
import { common, createLowlight } from 'lowlight'
import ImageResize from 'tiptap-extension-resize-image'
import { cn } from 'utils/handleClassName'
import { FontSize } from './extensions/fontSize'
import { ImageCatalogue } from './ImageCatalogue'
import { BetterCodeBlock } from './nodes/BetterCodeblock'
import { Toolbar } from './Toolbar'

import './Tiptap.scss'

export interface EditorProps {
  className?: string
  content?: string
  thumbnail?: string
  images?: string[]
  editable?: boolean
  autofocus?: boolean
  onChange?: (editor: Editor) => any
  onAddImage?: (image: string) => any
  onDeleteImage?: (image: string) => any
  onChangeThumbnail?: (image: string | null) => any
}

const lowlight = createLowlight(common)
lowlight.register({ django, dockerfile, nginx, pgsql })

export const Tiptap: FC<EditorProps> = ({
  className,
  content = '<p></p>',
  thumbnail,
  images = [],
  editable = true,
  autofocus = false,
  onChange = () => {},
  onAddImage,
  onDeleteImage,
  onChangeThumbnail
}) => {
  const [editor, setEditor] = useState<Editor>()

  useLayoutEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  useEffect(() => {
    if (!editor) return

    if (editor.getHTML() !== content) editor.commands.setContent(content)
  }, [editor, content])

  return (
    <div
      className={cn(className, 'Tiptap-wrapper', !editable && 'Tiptap-viewer')}
    >
      <EditorProvider
        extensions={[
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
          ImageResize,
          BetterCodeBlock.configure({
            lowlight
          }),
          TaskList,
          TaskItem.configure({
            nested: true
          })
        ]}
        slotBefore={editable && <Toolbar className='rounded-t' />}
        slotAfter={
          editable && (
            <ImageCatalogue
              thumbnail={thumbnail}
              images={images}
              addImage={onAddImage}
              deleteImage={onDeleteImage}
              changeThumbnail={onChangeThumbnail}
            />
          )
        }
        autofocus={autofocus}
        onCreate={({ editor }) => {
          editor.commands.setContent(content)
          setEditor(editor as Editor)
        }}
        onUpdate={({ editor }) => {
          if (editor.getHTML() !== content) onChange(editor as Editor)
        }}
        children
      />
    </div>
  )
}
