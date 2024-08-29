import { useCurrentEditor } from '@tiptap/react'

import {
  mdiRectangleOutline,
  mdiTableColumn,
  mdiTableColumnPlusAfter,
  mdiTableColumnPlusBefore,
  mdiTableColumnRemove,
  mdiTableMergeCells,
  mdiTableRow,
  mdiTableRowPlusAfter,
  mdiTableRowPlusBefore,
  mdiTableRowRemove,
  mdiTableSplitCell
} from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'

export const TableTools = () => {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  return (
    <div className='flex items-center divide-x divide-neutral-400 rounded border border-neutral-100 bg-neutral-50 p-1 *:flex *:items-center *:gap-1.5 *:px-2'>
      <div>
        <IconButton
          className='block'
          path={mdiTableRow}
          color='primary'
          variant='hover-text'
          tooltip='제목 행 전환'
          tooltipOptions={{
            placement: 'bottom',
            offset: 3
          }}
          onClick={() => editor.commands.toggleHeaderRow()}
        />

        <IconButton
          className='block'
          path={mdiTableColumn}
          color='primary'
          variant='hover-text'
          tooltip='제목 열 전환'
          tooltipOptions={{
            placement: 'bottom',
            offset: 3
          }}
          onClick={() => editor.commands.toggleHeaderColumn()}
        />

        <IconButton
          className='block'
          path={mdiRectangleOutline}
          color='primary'
          variant='hover-text-toggle'
          tooltip='셀 강조 전환'
          tooltipOptions={{
            placement: 'bottom',
            offset: 3
          }}
          active={editor.isActive('tableHeader')}
          onClick={() => editor.commands.toggleHeaderCell()}
        />
      </div>

      <div>
        <IconButton
          className='block'
          path={mdiTableRowPlusBefore}
          color='primary'
          variant='hover-text'
          tooltip='위쪽에 행 추가'
          tooltipOptions={{
            placement: 'bottom',
            offset: 3
          }}
          onClick={() => editor.commands.addRowBefore()}
        />

        <IconButton
          className='block'
          path={mdiTableRowPlusAfter}
          color='primary'
          variant='hover-text'
          tooltip='아래쪽에 행 추가'
          tooltipOptions={{
            placement: 'bottom',
            offset: 3
          }}
          onClick={() => editor.commands.addRowAfter()}
        />

        <IconButton
          className='block'
          path={mdiTableRowRemove}
          color='primary'
          variant='hover-text'
          tooltip='행 삭제'
          tooltipOptions={{
            placement: 'bottom',
            offset: 3
          }}
          onClick={() => editor.commands.deleteRow()}
        />
      </div>

      <div>
        <IconButton
          className='block'
          path={mdiTableColumnPlusBefore}
          color='primary'
          variant='hover-text'
          tooltip='왼쪽에 열 추가'
          tooltipOptions={{
            placement: 'bottom',
            offset: 3
          }}
          onClick={() => editor.commands.addColumnBefore()}
        />

        <IconButton
          className='block'
          path={mdiTableColumnPlusAfter}
          color='primary'
          variant='hover-text'
          tooltip='오른쪽에 열 추가'
          tooltipOptions={{
            placement: 'bottom',
            offset: 3
          }}
          onClick={() => editor.commands.addColumnAfter()}
        />

        <IconButton
          className='block'
          path={mdiTableColumnRemove}
          color='primary'
          variant='hover-text'
          tooltip='열 삭제'
          tooltipOptions={{
            placement: 'bottom',
            offset: 3
          }}
          onClick={() => editor.commands.deleteColumn()}
        />
      </div>

      {(editor.can().mergeCells() || editor.can().splitCell()) && (
        <IconButton
          className='block'
          path={
            editor.can().mergeCells() ? mdiTableMergeCells : mdiTableSplitCell
          }
          color='primary'
          variant='hover-text'
          tooltip={editor.can().mergeCells() ? '셀 합치기' : '셀 나누기'}
          tooltipOptions={{
            placement: 'bottom',
            offset: 3
          }}
          onClick={() => editor.commands.mergeOrSplit()}
        />
      )}
    </div>
  )
}
