import { FC } from 'react'
import { useCurrentEditor } from '@tiptap/react'
import { FloatingDelayGroup } from '@floating-ui/react'
import { cn } from 'utils/handleClassName'

import Icon from '@mdi/react'
import {
  mdiFormatAlignCenter,
  mdiFormatAlignJustify,
  mdiFormatAlignLeft,
  mdiFormatAlignRight,
  mdiFormatBold,
  mdiFormatColorHighlight,
  mdiFormatColorText,
  mdiFormatItalic,
  mdiFormatListBulleted,
  mdiFormatListNumbered,
  mdiFormatStrikethroughVariant,
  mdiFormatUnderline,
  mdiLinkVariant
} from '@mdi/js'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { IconButton } from 'components/Buttons/IconButton'
import { ColorSelector } from 'components/PopoverMenu/ColorSelector'
import { LinkConfigurer } from './LinkConfigurer'

const FontSizes = [
  11, 13, 15, 16, 19, 24, 28, 30, 34, 38, 42, 50, 60, 75, 90, 100
]

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

export const Toolbar: FC<{ className?: string }> = ({ className }) => {
  const { editor } = useCurrentEditor()

  const editorStyles = {
    fontSize: editor?.getAttributes('textStyle')?.fontSize || '16px',
    textColor: rgbStringToHex(editor?.getAttributes('textStyle')?.color),
    highlightColor: editor?.getAttributes('highlight')?.color,
    bold: editor?.isActive('bold'),
    italic: editor?.isActive('italic'),
    underline: editor?.isActive('underline'),
    strike: editor?.isActive('strike'),
    bulletList: editor?.isActive('bulletList'),
    orderedList: editor?.isActive('orderedList'),
    textAlign: {
      left: editor?.isActive({ textAlign: 'left' }),
      center: editor?.isActive({ textAlign: 'center' }),
      right: editor?.isActive({ textAlign: 'right' }),
      justify: editor?.isActive({ textAlign: 'justify' })
    },
    link: {
      active: Boolean(editor?.getAttributes('link').href),
      href: editor?.getAttributes('link').href,
      title: editor?.state.doc.textBetween(
        editor.view.state.selection.from,
        editor.view.state.selection.to,
        ''
      )
    }
  }

  return (
    <div
      className={cn(
        'flex items-center divide-x divide-neutral-400 bg-neutral-100 p-1',
        className
      )}
    >
      <FloatingDelayGroup delay={{ open: 250, close: 100 }}>
        <Tooltip placement='bottom' offset={3}>
          <TooltipTrigger asChild>
            <select
              className='form-input mx-2 w-28 px-2'
              value={editorStyles.fontSize}
              onChange={(e) => {
                editor?.chain().focus().setFontSize(e.target.value).run()
              }}
            >
              {FontSizes.map((size) => (
                <option key={`font-size-${size}`} value={`${size}px`}>
                  {`${size} px`}
                </option>
              ))}
            </select>
          </TooltipTrigger>
          <TooltipContent>글꼴 크기</TooltipContent>
        </Tooltip>

        <div className='flex items-center gap-1 px-2'>
          <ColorSelector
            className='h-fit'
            tooltipPlacement='bottom'
            description='텍스트 색상'
            value={editorStyles.textColor}
            onChange={(color) => {
              if (color) editor?.commands.setColor(color)
              else editor?.commands.unsetColor()
            }}
          >
            <ThemedButton
              className='block p-1'
              color='primary'
              variant='hover-text-toggle'
              active={Boolean(editorStyles.textColor)}
            >
              <Icon path={mdiFormatColorText} size={1} />
              <div
                className='h-2 w-full border border-neutral-300'
                style={{
                  backgroundColor: editorStyles.textColor
                }}
              />
            </ThemedButton>
          </ColorSelector>

          <ColorSelector
            className='h-fit'
            tooltipPlacement='bottom'
            description='배경색'
            value={editorStyles.highlightColor}
            onChange={(color) => {
              if (color) editor?.commands.setHighlight({ color })
              else editor?.commands.unsetHighlight()
            }}
          >
            <ThemedButton
              className='block p-1'
              color='primary'
              variant='hover-text-toggle'
              active={Boolean(editorStyles.highlightColor)}
            >
              <Icon path={mdiFormatColorHighlight} size={1} />
              <div
                className='h-2 w-full border border-neutral-300'
                style={{
                  backgroundColor: editorStyles.highlightColor
                }}
              />
            </ThemedButton>
          </ColorSelector>
        </div>

        <div className='flex gap-1 px-2'>
          <Tooltip placement='bottom' offset={3}>
            <TooltipTrigger asChild>
              <IconButton
                path={mdiFormatBold}
                color='primary'
                variant='hover-text-toggle'
                active={editorStyles.bold}
                onClick={() => {
                  console.log('click')
                  editor?.chain().focus().toggleBold().run()
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
                active={editorStyles.italic}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
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
                active={editorStyles.underline}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
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
                active={editorStyles.strike}
                onClick={() => editor?.chain().focus().toggleStrike().run()}
              />
            </TooltipTrigger>
            <TooltipContent>취소선</TooltipContent>
          </Tooltip>
        </div>

        <div className='flex gap-1 px-2'>
          <Tooltip placement='bottom' offset={3}>
            <TooltipTrigger asChild>
              <IconButton
                path={mdiFormatAlignLeft}
                color='primary'
                variant='hover-text-toggle'
                active={editorStyles.textAlign.left}
                onClick={() => editor?.commands.setTextAlign('left')}
              />
            </TooltipTrigger>
            <TooltipContent>왼쪽 맞춤</TooltipContent>
          </Tooltip>

          <Tooltip placement='bottom' offset={3}>
            <TooltipTrigger asChild>
              <IconButton
                path={mdiFormatAlignCenter}
                color='primary'
                variant='hover-text-toggle'
                active={editorStyles.textAlign.center}
                onClick={() => editor?.commands.setTextAlign('center')}
              />
            </TooltipTrigger>
            <TooltipContent>가운데 맞춤</TooltipContent>
          </Tooltip>

          <Tooltip placement='bottom' offset={3}>
            <TooltipTrigger asChild>
              <IconButton
                path={mdiFormatAlignRight}
                color='primary'
                variant='hover-text-toggle'
                active={editorStyles.textAlign.right}
                onClick={() => editor?.commands.setTextAlign('right')}
              />
            </TooltipTrigger>
            <TooltipContent>오른쪽 맞춤</TooltipContent>
          </Tooltip>

          <Tooltip placement='bottom' offset={3}>
            <TooltipTrigger asChild>
              <IconButton
                path={mdiFormatAlignJustify}
                color='primary'
                variant='hover-text-toggle'
                active={editorStyles.textAlign.justify}
                onClick={() => editor?.commands.setTextAlign('justify')}
              />
            </TooltipTrigger>
            <TooltipContent>자동</TooltipContent>
          </Tooltip>
        </div>

        <div className='flex gap-2 px-2'>
          <Tooltip placement='bottom' offset={3}>
            <TooltipTrigger asChild>
              <IconButton
                path={mdiFormatListBulleted}
                color='primary'
                variant='hover-text-toggle'
                active={editorStyles.bulletList}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              />
            </TooltipTrigger>
            <TooltipContent>순서 없는 목록</TooltipContent>
          </Tooltip>

          <Tooltip placement='bottom' offset={3}>
            <TooltipTrigger asChild>
              <IconButton
                path={mdiFormatListNumbered}
                color='primary'
                variant='hover-text-toggle'
                active={editorStyles.orderedList}
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
              />
            </TooltipTrigger>
            <TooltipContent>순서 있는 목록</TooltipContent>
          </Tooltip>
        </div>

        <div className='h-fit px-2'>
          <LinkConfigurer
            className='h-fit'
            description={`링크 ${editorStyles.link.active ? '편집' : '생성'}`}
            active={editorStyles.link.active}
            title={editorStyles.link.title}
            href={editorStyles.link.href}
            onChange={({ href, title }: { href: string; title: string }) =>
              editor
                ?.chain()
                .focus()
                .setLink({ href })
                .command(({ tr }) => {
                  tr.insertText(title)
                  return true
                })
                .run()
            }
            onDelete={() => editor?.chain().focus().unsetLink().run()}
          >
            <IconButton
              path={mdiLinkVariant}
              color='primary'
              variant='hover-text-toggle'
              active={editorStyles.link.active}
              onClick={() =>
                editor?.chain().focus().extendMarkRange('link').run()
              }
            />
          </LinkConfigurer>
        </div>
      </FloatingDelayGroup>
    </div>
  )
}
