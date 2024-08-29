import { useCurrentEditor } from '@tiptap/react'

import {
  mdiFormatAlignCenter,
  mdiFormatAlignJustify,
  mdiFormatAlignLeft,
  mdiFormatAlignRight
} from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'

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
      <IconButton
        className='block'
        path={mdiFormatAlignLeft}
        color='primary'
        variant='hover-text-toggle'
        active={textAlignLeft}
        tooltip='왼쪽 맞춤'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => editor.commands.setTextAlign('left')}
      />

      <IconButton
        className='block'
        path={mdiFormatAlignCenter}
        color='primary'
        variant='hover-text-toggle'
        active={textAlignCenter}
        tooltip='가운데 맞춤'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => editor.commands.setTextAlign('center')}
      />

      <IconButton
        className='block'
        path={mdiFormatAlignRight}
        color='primary'
        variant='hover-text-toggle'
        active={textAlignRight}
        tooltip='오른쪽 맞춤'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => editor.commands.setTextAlign('right')}
      />

      <IconButton
        className='block'
        path={mdiFormatAlignJustify}
        color='primary'
        variant='hover-text-toggle'
        active={textAlignJustify}
        tooltip='양쪽 맞춤'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => editor.commands.setTextAlign('justify')}
      />
    </div>
  )
}
