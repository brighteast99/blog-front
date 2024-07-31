import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Editor, EditorProvider } from '@tiptap/react'

import { cn } from 'utils/handleClassName'

import { getExtensions } from './editor'
import { ImageCatalogue } from './UI/ImageCatalogue'
import { Toolbar } from './UI/Toolbar'

import type { FC } from 'react'

import './Tiptap.scss'

interface EditorProps {
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
  const extensions = useMemo(() => getExtensions(editable), [editable])

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
        extensions={extensions}
        slotBefore={editable && <Toolbar className='rounded-t' />}
        slotAfter={
          editable && (
            <div className='contents'>
              <div className='rounded-b border border-neutral-100 bg-neutral-100 bg-opacity-50 px-1 py-0.5'>
                <p className='text-right text-sm text-neutral-600'>
                  {`${editor?.storage.characterCount.words()} 단어 (${editor?.storage.characterCount.characters()} 자)`}
                </p>
              </div>
              <ImageCatalogue
                thumbnail={thumbnail}
                images={images}
                addImage={onAddImage}
                deleteImage={onDeleteImage}
                changeThumbnail={onChangeThumbnail}
              />
            </div>
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
