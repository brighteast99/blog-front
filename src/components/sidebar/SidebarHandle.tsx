import clsx from 'clsx'

import { cn } from 'utils/handleClassName'

import type { FC } from 'react'

export const SidebarHandle: FC<{
  className?: string
  sidebarFolded?: boolean
  toggle?: (_?: any) => any
}> = ({ className, sidebarFolded, toggle }) => {
  return (
    <button
      className={cn(
        'group size-fit p-1 opacity-25 transition-opacity *:h-7 *:w-1.5 *:rounded-full *:bg-neutral-800 *:transition-transform hover:opacity-50',
        className
      )}
      onClick={() => toggle?.()}
    >
      <div
        className={clsx(sidebarFolded ? '-rotate-12' : 'group-hover:rotate-12')}
      />
      <div
        className={clsx(
          '-mt-1',
          sidebarFolded ? 'rotate-12' : 'group-hover:-rotate-12'
        )}
      />
    </button>
  )
}
