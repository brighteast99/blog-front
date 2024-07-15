import { FC, useEffect, useLayoutEffect, useState } from 'react'
import { cn } from 'utils/handleClassName'
import { EditorProvider, Editor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'
import { Link } from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import { common, createLowlight } from 'lowlight'
import { FontSize } from './extensions/fontSize'
import { Toolbar } from './Toolbar'
import { ImageCatalogue } from './ImageCatalogue'

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
          Image.configure({
            inline: true
          }),
          CodeBlockLowlight.configure({
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
