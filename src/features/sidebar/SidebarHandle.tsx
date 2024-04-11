import { useAppDispatch, useAppSelector } from "app/hooks"
import { FC } from "react"
import { selectSidebarIsFolded, toggle } from "./sidebarSlice"
import { cn } from "utils/handleClassName"
import clsx from "clsx"

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
