import { useCallback, useMemo } from 'react'
import clsx from 'clsx'

import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiPageFirst,
  mdiPageLast
} from '@mdi/js'
import { IconButton } from './Buttons/IconButton'

import type { FC, MouseEvent } from 'react'

interface PaginatorProps {
  className?: string
  pages: number
  currentPage: number
  pageSize?: number
  onPageChanged?: (page: number) => any
}

export const Paginator: FC<PaginatorProps> = ({
  className,
  pages,
  currentPage,
  pageSize = 10,
  onPageChanged
}) => {
  const offset = currentPage - (currentPage % pageSize)
  const hasPrevPageset = offset > 0
  const hasNextPageset = pages > offset + pageSize
  const pageset = useMemo(() => {
    let result = []
    for (let i = 0; i < pageSize && offset + i < pages; i++)
      result.push(offset + i)
    return result
  }, [pageSize, offset, pages])

  const clickHandler = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const pageIdx =
        Number.parseInt(e.currentTarget.dataset.pageIdx as string) || 0

      return onPageChanged?.(pageIdx)
    },
    [onPageChanged]
  )

  return (
    <div className={clsx('flex justify-center gap-3 py-4', className)}>
      <div className='flex'>
        <IconButton
          className='p-0'
          variant='hover-text'
          path={mdiPageFirst}
          disabled={!hasPrevPageset}
          data-page-idx={offset - 1}
          onClick={clickHandler}
        />
        <IconButton
          className='p-0'
          variant='hover-text'
          path={mdiChevronLeft}
          disabled={!currentPage}
          data-page-idx={currentPage - 1}
          onClick={clickHandler}
        />
      </div>
      {pageset.map((pageIdx) => {
        const isActive = currentPage === pageIdx
        return (
          <button
            key={pageIdx}
            className={clsx(
              'p-1 text-xl transition-colors',
              isActive
                ? 'text-primary'
                : 'text-neutral-500 hover:text-neutral-800'
            )}
            disabled={isActive}
            onClick={clickHandler}
            data-page-idx={pageIdx}
          >
            {pageIdx + 1}
          </button>
        )
      })}
      <div className='flex'>
        <IconButton
          className='p-0'
          variant='hover-text'
          path={mdiChevronRight}
          disabled={currentPage === pages - 1}
          data-page-idx={currentPage + 1}
          onClick={clickHandler}
        />
        <IconButton
          className='p-0'
          variant='hover-text'
          path={mdiPageLast}
          disabled={!hasNextPageset}
          data-page-idx={offset + pageSize}
          onClick={clickHandler}
        />
      </div>
    </div>
  )
}
