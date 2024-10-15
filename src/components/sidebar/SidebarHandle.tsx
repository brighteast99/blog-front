import clsx from 'clsx'

import { cn } from 'utils/handleClassName'

import type { FC } from 'react'

export const SidebarHandle: FC<{
  className?: string
  sidebarFolded?: boolean
  disabled?: boolean
  toggle?: (_?: any) => any
}> = ({ className, sidebarFolded, disabled, toggle }) => {
  return (
    <button
      className={cn(
        'group size-fit p-1 opacity-25 transition-opacity *:h-7 *:w-1.5 *:rounded-full *:bg-neutral-800 *:transition-transform',
        !disabled && 'hover:opacity-50',
        className
      )}
      disabled={disabled}
      onClick={toggle}
    >
      <div
        className={clsx(
          !disabled && (sidebarFolded ? '-rotate-12' : 'group-hover:rotate-12')
        )}
      />
      <div
        className={clsx(
          '-mt-1',
          !disabled && (sidebarFolded ? 'rotate-12' : 'group-hover:-rotate-12')
        )}
      />
    </button>
  )
}
