import { FC, useLayoutEffect, useState } from 'react'
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

import styles from './Tiptap.module.scss'

export interface EditorProps {
  className?: string
  content?: string
  editable?: boolean
  autofocus?: boolean
  onChange?: (editor: Editor) => void
}

export const Tiptap: FC<EditorProps> = ({
  className,
  content = '',
  editable = true,
  autofocus = false,
  onChange = () => {}
}) => {
  const [editor, setEditor] = useState<Editor>()

  useLayoutEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  return (
    <div className={cn(className, styles.wrapper, !editable && styles.viewer)}>
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
          })
        ]}
        slotBefore={editable && <Toolbar className='rounded-t' />}
        content={content}
        autofocus={autofocus}
        onCreate={({ editor }) => setEditor(editor as Editor)}
        onUpdate={({ editor }) => onChange(editor as Editor)}
        children
      />
    </div>
  )
}
