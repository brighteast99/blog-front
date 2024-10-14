import { useCurrentEditor } from '@tiptap/react'

import Icon from '@mdi/react'
import {
  mdiFormatColorHighlight,
  mdiFormatColorText,
  mdiFormatFontSizeDecrease,
  mdiFormatFontSizeIncrease,
  mdiFormatSize
} from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { FontSize } from 'components/Tiptap/extensions/FontSize'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'
import { ColorSelector } from './ColorSelector'

import type { FC } from 'react'

function rgbStringToHex(string: string): string {
  if (/^#[0-9a-zA-Z]{6}$/.test(string)) return string

  const match = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/.exec(string)

  if (!match) return ''

  let rgb = match.slice(1, 4).map(Number)

  return (
    '#' +
    rgb.map((val) => val.toString(16).toUpperCase().padStart(2, '0')).join('')
  )
}

export const TextStyleTools: FC = () => {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  const fontSize = Number.parseFloat(
    editor.getAttributes('textStyle')?.fontSize ?? '1rem'
  )
  const textColor = rgbStringToHex(editor.getAttributes('textStyle')?.color)
  const highlightColor = editor.getAttributes('highlight')?.color

  return (
    <div>
      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <div className='border-bottom focus:outline-none; flex border-b border-neutral-400 bg-transparent px-1 transition-colors focus-within:border-primary hover:border-neutral-600'>
            <Icon path={mdiFormatSize} size={1} />
            <select
              className='form-input w-28 border-none py-1 pl-2 pr-4 text-center'
              value={fontSize}
              onChange={(e) => {
                if (e.target.value === '16')
                  editor.chain().focus().unsetFontSize().run()
                else
                  editor
                    .chain()
                    .focus()
                    .setFontSize(Number.parseFloat(e.target.value))
                    .run()
              }}
            >
              {FontSize.options.sizeOptions.map((size) => (
                <option key={`font-size-${size}`} value={size}>
                  {`${Math.trunc(size * 16)} px`}
                </option>
              ))}
            </select>
          </div>
        </TooltipTrigger>
        <TooltipContent>글꼴 크기</TooltipContent>
      </Tooltip>

      <IconButton
        path={mdiFormatFontSizeDecrease}
        color='primary'
        variant='hover-text'
        disabled={fontSize <= FontSize.options.sizeOptions[0]}
        tooltip='글꼴 작게'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => editor.chain().focus().shrinkFontSize().run()}
      />

      <IconButton
        path={mdiFormatFontSizeIncrease}
        color='primary'
        variant='hover-text'
        disabled={
          fontSize >=
          FontSize.options.sizeOptions[FontSize.options.sizeOptions.length - 1]
        }
        tooltip='글꼴 크게'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => editor.chain().focus().enlargeFontSize().run()}
      />

      <ColorSelector
        className='h-fit'
        tooltipPlacement='bottom'
        description='텍스트 색상'
        value={textColor}
        onChange={(color) => {
          if (color) editor.commands.setColor(color)
          else editor.commands.unsetColor()
        }}
      >
        <ThemedButton
          className='block p-1'
          color='primary'
          variant='hover-text-toggle'
          active={Boolean(textColor)}
        >
          <Icon path={mdiFormatColorText} size={1} />
          <div
            className='h-2 w-full border border-neutral-300'
            style={{
              backgroundColor: textColor
            }}
          />
        </ThemedButton>
      </ColorSelector>

      <ColorSelector
        className='h-fit'
        tooltipPlacement='bottom'
        description='배경색'
        value={highlightColor}
        onChange={(color) => {
          if (color) editor.commands.setHighlight({ color })
          else editor.commands.unsetHighlight()
        }}
      >
        <ThemedButton
          className='block p-1'
          color='primary'
          variant='hover-text-toggle'
          active={Boolean(highlightColor)}
        >
          <Icon path={mdiFormatColorHighlight} size={1} />
          <div
            className='h-2 w-full border border-neutral-300'
            style={{
              backgroundColor: highlightColor
            }}
          />
        </ThemedButton>
      </ColorSelector>
    </div>
  )
}
