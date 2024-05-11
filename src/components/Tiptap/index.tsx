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
import { Toolbar } from './Toolbar'
import { FontSize } from './extensions/fontSize'

import './Tiptap.scss'
import Image from '@tiptap/extension-image'
import { ImageCatalogue } from './ImageCatalogue'

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
          StarterKit,
          FontSize,
          Underline,
          TextStyle,
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
            validate: (href) => /^https?:\/\//.test(href)
          }),
          Image.configure({
            inline: true
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
