import { useCallback } from 'react'
import clsx from 'clsx'

import type { FC, MouseEvent } from 'react'

interface PaginatorProps {
  pages: number
  currentPage: number
  onPageChanged?: (page: number) => any
}

export const Paginator: FC<PaginatorProps> = ({
  pages,
  currentPage,
  onPageChanged
}) => {
  const clickHandler = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const pageIdx =
        Number.parseInt(e.currentTarget.dataset.pageIdx as string) || 0

      return onPageChanged?.(pageIdx)
    },
    [onPageChanged]
  )

  return (
    <div className='flex justify-center gap-2 py-1'>
      {Array.from({ length: pages }, (_, i) => {
        const isActive = currentPage === i
        return (
          <button
            key={i}
            className={clsx(
              'p-1',
              isActive
                ? 'text-primary'
                : 'text-neutral-500 hover:text-neutral-800'
            )}
            disabled={isActive}
            onClick={clickHandler}
            data-page-idx={i}
          >
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}
