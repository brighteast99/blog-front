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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

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
      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            path={mdiFormatBold}
            color='primary'
            variant='hover-text-toggle'
            active={bold}
            onClick={() => {
              editor.chain().focus().toggleBold().run()
            }}
          />
        </TooltipTrigger>
        <TooltipContent>굵게</TooltipContent>
      </Tooltip>

      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            path={mdiFormatItalic}
            color='primary'
            variant='hover-text-toggle'
            active={italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
        </TooltipTrigger>
        <TooltipContent>기울임</TooltipContent>
      </Tooltip>

      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            path={mdiFormatUnderline}
            color='primary'
            variant='hover-text-toggle'
            active={underline}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
        </TooltipTrigger>
        <TooltipContent>밑줄</TooltipContent>
      </Tooltip>

      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            path={mdiFormatStrikethroughVariant}
            color='primary'
            variant='hover-text-toggle'
            active={strike}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
        </TooltipTrigger>
        <TooltipContent>취소선</TooltipContent>
      </Tooltip>

      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            path={mdiFormatSuperscript}
            color='primary'
            variant='hover-text-toggle'
            active={superscript}
            onClick={() => {
              editor.chain().focus().unsetSubscript().toggleSuperscript().run()
            }}
          />
        </TooltipTrigger>
        <TooltipContent>위첨자</TooltipContent>
      </Tooltip>

      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            path={mdiFormatSubscript}
            color='primary'
            variant='hover-text-toggle'
            active={subscript}
            onClick={() => {
              editor.chain().focus().unsetSuperscript().toggleSubscript().run()
            }}
          />
        </TooltipTrigger>
        <TooltipContent>아래첨자</TooltipContent>
      </Tooltip>
    </div>
  )
}
