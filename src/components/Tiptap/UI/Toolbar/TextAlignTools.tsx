import { useCurrentEditor } from '@tiptap/react'

import {
  mdiFormatAlignCenter,
  mdiFormatAlignJustify,
  mdiFormatAlignLeft,
  mdiFormatAlignRight
} from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

import type { FC } from 'react'

export const TextAlignTools: FC = () => {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  const textAlignLeft = editor.isActive({ textAlign: 'left' })
  const textAlignCenter = editor.isActive({ textAlign: 'center' })
  const textAlignRight = editor.isActive({ textAlign: 'right' })
  const textAlignJustify = editor.isActive({ textAlign: 'justify' })

  return (
    <div>
      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            className='block'
            path={mdiFormatAlignLeft}
            color='primary'
            variant='hover-text-toggle'
            active={textAlignLeft}
            onClick={() => editor.commands.setTextAlign('left')}
          />
        </TooltipTrigger>
        <TooltipContent>왼쪽 맞춤</TooltipContent>
      </Tooltip>

      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            className='block'
            path={mdiFormatAlignCenter}
            color='primary'
            variant='hover-text-toggle'
            active={textAlignCenter}
            onClick={() => editor.commands.setTextAlign('center')}
          />
        </TooltipTrigger>
        <TooltipContent>가운데 맞춤</TooltipContent>
      </Tooltip>

      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            className='block'
            path={mdiFormatAlignRight}
            color='primary'
            variant='hover-text-toggle'
            active={textAlignRight}
            onClick={() => editor.commands.setTextAlign('right')}
          />
        </TooltipTrigger>
        <TooltipContent>오른쪽 맞춤</TooltipContent>
      </Tooltip>

      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            className='block'
            path={mdiFormatAlignJustify}
            color='primary'
            variant='hover-text-toggle'
            active={textAlignJustify}
            onClick={() => editor.commands.setTextAlign('justify')}
          />
        </TooltipTrigger>
        <TooltipContent>양쪽 맞춤</TooltipContent>
      </Tooltip>
    </div>
  )
}
