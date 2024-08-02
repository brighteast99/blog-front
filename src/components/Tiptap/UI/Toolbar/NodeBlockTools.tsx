import { useCurrentEditor } from '@tiptap/react'

import {
  mdiCodeBraces,
  mdiDetails,
  mdiFormatListBulleted,
  mdiFormatListCheckbox,
  mdiFormatListNumbered,
  mdiFormatQuoteClose,
  mdiLinkVariant,
  mdiTable,
  mdiTableOff
} from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { PopoverMenu } from 'components/PopoverMenu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'
import { CodeBlockConfigurer } from './CodeBlockConfigurer'
import { LinkConfigurer } from './LinkConfigurer'

import type { FC } from 'react'

export const NodeBlockTools: FC = () => {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  const bulletList = editor.isActive('bulletList')
  const orderedList = editor.isActive('orderedList')
  const taskList = editor.isActive('taskList')
  const blockquote = editor.isActive('blockquote')
  const details = editor.isActive('details')
  const codeBlock = {
    active: editor.isActive('codeBlock'),
    language: editor.getAttributes('codeBlock').language
  }
  const link = {
    active: Boolean(editor.getAttributes('link').href),
    href: editor.getAttributes('link').href,
    title: editor.state.doc.textBetween(
      editor.view.state.selection.from,
      editor.view.state.selection.to,
      ''
    )
  }
  const table = editor.isActive('table')

  return (
    <div>
      <PopoverMenu
        description='목록'
        tooltipPlacement='bottom'
        menuBtn={
          <IconButton
            path={orderedList ? mdiFormatListNumbered : mdiFormatListBulleted}
            active={bulletList || orderedList || taskList}
            variant='hover-text-toggle'
          />
        }
        placement='bottom'
      >
        <Tooltip placement='right' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiFormatListBulleted}
              color='primary'
              variant='hover-text-toggle'
              active={bulletList}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
          </TooltipTrigger>
          <TooltipContent>
            {bulletList ? '목록 해제' : '순서 없는 목록'}
          </TooltipContent>
        </Tooltip>

        <Tooltip placement='right' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiFormatListNumbered}
              color='primary'
              variant='hover-text-toggle'
              active={orderedList}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
          </TooltipTrigger>
          <TooltipContent>
            {orderedList ? '목록 해제' : '순서 있는 목록'}
          </TooltipContent>
        </Tooltip>

        <Tooltip placement='right' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiFormatListCheckbox}
              color='primary'
              variant='hover-text-toggle'
              active={taskList}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            />
          </TooltipTrigger>
          <TooltipContent>
            {taskList ? '목록 해제' : '체크리스트'}
          </TooltipContent>
        </Tooltip>
      </PopoverMenu>

      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            path={mdiFormatQuoteClose}
            color='primary'
            variant='hover-text-toggle'
            active={blockquote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
        </TooltipTrigger>
        <TooltipContent>인용문</TooltipContent>
      </Tooltip>

      <CodeBlockConfigurer
        className='h-fit'
        description={`코드 블록 ${codeBlock.active ? '편집' : '삽입'}`}
        active={codeBlock.active}
        language={codeBlock.language}
        onChange={(language: string) =>
          editor.chain().focus().setCodeBlock({ language }).run()
        }
        onDelete={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <IconButton
          path={mdiCodeBraces}
          color='primary'
          variant='hover-text-toggle'
          active={codeBlock.active}
        />
      </CodeBlockConfigurer>

      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            path={mdiDetails}
            color='primary'
            variant='hover-text-toggle'
            active={details}
            onClick={() => {
              if (details) editor.chain().focus().unsetDetails().run()
              else editor.chain().focus().setDetails().run()
            }}
          />
        </TooltipTrigger>
        <TooltipContent>요약</TooltipContent>
      </Tooltip>

      <Tooltip placement='bottom' offset={3}>
        <TooltipTrigger asChild>
          <IconButton
            path={table ? mdiTableOff : mdiTable}
            color='primary'
            variant='hover-text-toggle'
            active={table}
            onClick={() => {
              if (table) editor.chain().focus().deleteTable().run()
              else
                editor.chain().focus().insertTable({ rows: 2, cols: 2 }).run()
            }}
          />
        </TooltipTrigger>
        <TooltipContent>{table ? '표 삭제' : '표 삽입'}</TooltipContent>
      </Tooltip>

      <LinkConfigurer
        className='h-fit'
        description={`링크 ${link.active ? '편집' : '생성'}`}
        active={link.active}
        title={link.title}
        href={link.href}
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
        onDelete={() => editor.chain().focus().unsetLink().run()}
      >
        <IconButton
          path={mdiLinkVariant}
          color='primary'
          variant='hover-text-toggle'
          active={link.active}
          onClick={() => editor.chain().focus().extendMarkRange('link').run()}
        />
      </LinkConfigurer>
    </div>
  )
}
