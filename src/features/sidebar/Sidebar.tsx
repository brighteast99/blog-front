import { FC, useLayoutEffect, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import clsx from 'clsx'
import { cn } from 'utils/handleClassName'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { expand, selectSidebarIsFolded, toggle } from './sidebarSlice'

import { Avatar } from 'components/Avatar'
import { Spinner } from 'components/Spinner'
import { CategoryList } from './CategoryList'

export interface SidebarProps {
  /**
   * Is sidebar foldable or not.
   * Mobile, Tablet: true / Desktop: False
   */
  foldable?: boolean
}

export const SidebarHandle: FC<{ className?: string }> = ({ className }) => {
  const dispatch = useAppDispatch()
  const sidebarIsFolded = useAppSelector(selectSidebarIsFolded)

  return (
    <button
      className={cn(
        'group size-fit p-1 opacity-25 transition-opacity *:h-7 *:w-1.5 *:rounded-full *:bg-neutral-800 *:transition-transform hover:opacity-50',
        className
      )}
      onClick={() => dispatch(toggle())}
    >
      <div
        className={clsx(
          sidebarIsFolded ? '-rotate-12' : 'group-hover:rotate-12'
        )}
      />
      <div
        className={clsx(
          '-mt-1',
          sidebarIsFolded ? 'rotate-12' : 'group-hover:-rotate-12'
        )}
      />
    </button>
  )
}

export const Sidebar: FC<SidebarProps> = ({ foldable = false }) => {
  const dispatch = useAppDispatch()
  const isFolded = useAppSelector(selectSidebarIsFolded)

  useLayoutEffect(() => {
    dispatch(expand())
  }, [dispatch, foldable])

  return (
    <div
      className={clsx(
        'h-full w-72 overflow-hidden bg-neutral-200 transition-[max-width,min-width]',
        isFolded ? 'min-w-0 max-w-0' : 'min-w-72 max-w-72'
      )}
    >
      <div className='mx-4 flex size-full w-64 flex-col py-8'>
        <Avatar className='mx-auto mb-2 shrink-0' size='2xl' />
        <p className='text-center text-lg font-semibold'>기록장</p>
        <p className='text-center'>블로그 소개</p>

        <hr className='mb-4 mt-2' />

        <div className='relative min-h-0 grow overflow-y-auto'>
          <ErrorBoundary fallback={<p>Failed to load category list</p>}>
            <Suspense
              fallback={<Spinner size='sm' className='absolute inset-0' />}
            >
              <CategoryList />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
