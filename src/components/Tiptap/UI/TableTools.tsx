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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

export const TableTools = () => {
  const { editor } = useCurrentEditor()

  if (!editor) return null

  return (
    <div className='flex items-center divide-x divide-neutral-400 rounded border border-neutral-100 bg-neutral-50 p-1 *:flex *:items-center *:gap-1.5 *:px-2'>
      <div>
        <Tooltip placement='bottom' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiTableRow}
              color='primary'
              variant='hover-text'
              active
              onClick={() => editor.commands.toggleHeaderRow()}
            />
          </TooltipTrigger>
          <TooltipContent>제목 행 전환</TooltipContent>
        </Tooltip>

        <Tooltip placement='bottom' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiTableColumn}
              color='primary'
              variant='hover-text'
              active
              onClick={() => editor.commands.toggleHeaderColumn()}
            />
          </TooltipTrigger>
          <TooltipContent>제목 열 전환</TooltipContent>
        </Tooltip>

        <Tooltip placement='bottom' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiRectangleOutline}
              color='primary'
              variant='hover-text-toggle'
              active={editor.isActive('tableHeader')}
              onClick={() => editor.commands.toggleHeaderCell()}
            />
          </TooltipTrigger>
          <TooltipContent>셀 강조 전환</TooltipContent>
        </Tooltip>
      </div>

      <div>
        <Tooltip placement='bottom' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiTableRowPlusBefore}
              color='primary'
              variant='hover-text'
              active
              onClick={() => editor.commands.addRowBefore()}
            />
          </TooltipTrigger>
          <TooltipContent>위쪽에 행 추가</TooltipContent>
        </Tooltip>

        <Tooltip placement='bottom' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiTableRowPlusAfter}
              color='primary'
              variant='hover-text'
              active
              onClick={() => editor.commands.addRowAfter()}
            />
          </TooltipTrigger>
          <TooltipContent>아래쪽에 행 추가</TooltipContent>
        </Tooltip>

        <Tooltip placement='bottom' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiTableRowRemove}
              color='primary'
              variant='hover-text'
              active
              onClick={() => editor.commands.deleteRow()}
            />
          </TooltipTrigger>
          <TooltipContent>행 삭제</TooltipContent>
        </Tooltip>
      </div>

      <div>
        <Tooltip placement='bottom' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiTableColumnPlusBefore}
              color='primary'
              variant='hover-text'
              active
              onClick={() => editor.commands.addColumnBefore()}
            />
          </TooltipTrigger>
          <TooltipContent>왼쪽에 열 추가</TooltipContent>
        </Tooltip>

        <Tooltip placement='bottom' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiTableColumnPlusAfter}
              color='primary'
              variant='hover-text'
              active
              onClick={() => editor.commands.addColumnAfter()}
            />
          </TooltipTrigger>
          <TooltipContent>오른쪽에 열 추가</TooltipContent>
        </Tooltip>

        <Tooltip placement='bottom' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={mdiTableColumnRemove}
              color='primary'
              variant='hover-text'
              active
              onClick={() => editor.commands.deleteColumn()}
            />
          </TooltipTrigger>
          <TooltipContent>열 삭제</TooltipContent>
        </Tooltip>
      </div>

      {(editor.can().mergeCells() || editor.can().splitCell()) && (
        <Tooltip placement='bottom' offset={3}>
          <TooltipTrigger asChild>
            <IconButton
              className='block'
              path={
                editor.can().mergeCells()
                  ? mdiTableMergeCells
                  : mdiTableSplitCell
              }
              color='primary'
              variant='hover-text'
              onClick={() => editor.commands.mergeOrSplit()}
            />
          </TooltipTrigger>
          <TooltipContent>
            {editor.can().mergeCells() ? '셀 합치기' : '셀 나누기'}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
