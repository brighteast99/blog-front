import { useCurrentEditor } from '@tiptap/react'

import {
  mdiFormatBold,
  mdiFormatItalic,
  mdiFormatStrikethroughVariant,
  mdiFormatSubscript,
  mdiFormatSuperscript,
  mdiFormatUnderline
} from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'

import type { FC } from 'react'

export const TextDecorationTools: FC = () => {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  const bold = editor.isActive('bold')
  const italic = editor.isActive('italic')
  const underline = editor.isActive('underline')
  const strike = editor.isActive('strike')
  const superscript = editor.isActive('superscript')
  const subscript = editor.isActive('subscript')

  return (
    <div>
      <IconButton
        path={mdiFormatBold}
        color='primary'
        variant='hover-text-toggle'
        active={bold}
        tooltip='굵게'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => {
          editor.chain().focus().toggleBold().run()
        }}
      />

      <IconButton
        path={mdiFormatItalic}
        color='primary'
        variant='hover-text-toggle'
        active={italic}
        tooltip='기울임'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />

      <IconButton
        path={mdiFormatUnderline}
        color='primary'
        variant='hover-text-toggle'
        active={underline}
        tooltip='밑줄'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />

      <IconButton
        path={mdiFormatStrikethroughVariant}
        color='primary'
        variant='hover-text-toggle'
        active={strike}
        tooltip='취소선'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />

      <IconButton
        path={mdiFormatSuperscript}
        color='primary'
        variant='hover-text-toggle'
        active={superscript}
        tooltip='위첨자'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => {
          editor.chain().focus().unsetSubscript().toggleSuperscript().run()
        }}
      />

      <IconButton
        path={mdiFormatSubscript}
        color='primary'
        variant='hover-text-toggle'
        active={subscript}
        tooltip='아래첨자'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => {
          editor.chain().focus().unsetSuperscript().toggleSubscript().run()
        }}
      />
    </div>
  )
}
