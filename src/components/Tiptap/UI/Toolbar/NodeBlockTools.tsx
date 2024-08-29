import { useMemo } from 'react'
import { useCurrentEditor } from '@tiptap/react'

import {
  mdiCodeBraces,
  mdiDetails,
  mdiFormatListBulleted,
  mdiFormatListCheckbox,
  mdiFormatListNumbered,
  mdiFormatQuoteOpen,
  mdiInformationBox,
  mdiLinkVariant,
  mdiTable,
  mdiTableOff
} from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { PopoverMenu } from 'components/PopoverMenu'
import { Languages } from 'components/Tiptap/extensions/BetterCodeblock'
import { CalloutTypes } from 'components/Tiptap/extensions/Callout'
import { AttributeSetter } from 'components/Tiptap/UI/Toolbar/AttributeSetter'
import { LinkConfigurer } from './LinkConfigurer'

import type { FC } from 'react'
import type { CodeBlockLanguage } from 'components/Tiptap/extensions/BetterCodeblock'
import type { CalloutType } from 'components/Tiptap/extensions/Callout'

export const NodeBlockTools: FC = () => {
  const { editor } = useCurrentEditor()

  const CodeBlockConfigurer = useMemo(
    () => AttributeSetter<CodeBlockLanguage>('코드 블록', 'bash', Languages),
    []
  )

  const CalloutConfigurer = useMemo(
    () => AttributeSetter<CalloutType>('콜아웃', 'note', CalloutTypes),
    []
  )

  if (!editor) return null

  const bulletList = editor.isActive('bulletList')
  const orderedList = editor.isActive('orderedList')
  const taskList = editor.isActive('taskList')
  const blockquote = editor.isActive('blockquote')
  const callout = {
    active: editor.isActive('callout'),
    type: editor.getAttributes('callout').type
  }
  const codeBlock = {
    active: editor.isActive('codeBlock'),
    language: editor.getAttributes('codeBlock').language
  }
  const details = editor.isActive('details')
  const link = {
    active: Boolean(editor.getAttributes('link').href),
    href: editor.getAttributes('link').link,
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
        <IconButton
          className='block'
          path={mdiFormatListBulleted}
          color='primary'
          variant='hover-text-toggle'
          active={bulletList}
          tooltip={bulletList ? '목록 해제' : '순서 없는 목록'}
          tooltipOptions={{
            placement: 'right',
            offset: 3
          }}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />

        <IconButton
          className='block'
          path={mdiFormatListNumbered}
          color='primary'
          variant='hover-text-toggle'
          active={orderedList}
          tooltip={orderedList ? '목록 해제' : '순서 있는 목록'}
          tooltipOptions={{
            placement: 'right',
            offset: 3
          }}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />

        <IconButton
          className='block'
          path={mdiFormatListCheckbox}
          color='primary'
          variant='hover-text-toggle'
          active={taskList}
          tooltip={taskList ? '목록 해제' : '체크리스트'}
          tooltipOptions={{
            placement: 'right',
            offset: 3
          }}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        />
      </PopoverMenu>

      <IconButton
        path={mdiFormatQuoteOpen}
        color='primary'
        variant='hover-text-toggle'
        active={blockquote}
        tooltip='인용문'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />

      <CalloutConfigurer
        className='h-fit'
        active={callout.active}
        option={callout.type}
        onChange={(type: CalloutType) =>
          editor.chain().focus().setCallout({ type }).run()
        }
        onDelete={() => editor.chain().focus().toggleCallout().run()}
      >
        <IconButton
          path={mdiInformationBox}
          color='primary'
          variant='hover-text-toggle'
          active={callout.active}
        />
      </CalloutConfigurer>

      <CodeBlockConfigurer
        className='h-fit'
        active={codeBlock.active}
        option={codeBlock.language}
        onChange={(language: CodeBlockLanguage) =>
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

      <IconButton
        path={mdiDetails}
        color='primary'
        variant='hover-text-toggle'
        active={details}
        tooltip='요약'
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => {
          if (details) editor.chain().focus().unsetDetails().run()
          else editor.chain().focus().setDetails().run()
        }}
      />

      <IconButton
        path={table ? mdiTableOff : mdiTable}
        color='primary'
        variant='hover-text-toggle'
        active={table}
        tooltip={table ? '표 삭제' : '표 삽입'}
        tooltipOptions={{
          placement: 'bottom',
          offset: 3
        }}
        onClick={() => {
          if (table) editor.chain().focus().deleteTable().run()
          else editor.chain().focus().insertTable({ rows: 2, cols: 2 }).run()
        }}
      />

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
