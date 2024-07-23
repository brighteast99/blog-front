import { FC } from 'react'
import clsx from 'clsx'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { cn } from 'utils/handleClassName'
import { selectSidebarIsFolded, toggle } from './sidebarSlice'

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
