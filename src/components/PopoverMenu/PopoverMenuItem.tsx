import clsx from 'clsx'

import Icon from '@mdi/react'
import { mdiLoading } from '@mdi/js'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

import type { FC } from 'react'
import type { Placement } from '@floating-ui/react'
import type { IconProps } from '@mdi/react/dist/IconProps'

interface PopoverMenuItemProps {
  icon: string
  iconOnRight?: boolean
  title: string
  description?: string | number | boolean
  tooltipPlacement?: Placement
  loading?: boolean
  disabled?: boolean
  className?: string
  iconProps?: IconProps
  onClick?: () => any
}

export const PopoverMenuItem: FC<PopoverMenuItemProps> = ({
  icon,
  iconOnRight = false,
  title,
  description,
  tooltipPlacement = 'left-start',
  loading = false,
  disabled = false,
  className,
  iconProps,
  onClick
}) => {
  return (
    <Tooltip placement={tooltipPlacement}>
      <TooltipTrigger asChild>
        <li>
          <button
            type="button"
            className={clsx(
              'flex size-full select-none items-center text-nowrap !bg-opacity-0 px-2 py-1 text-left',
              disabled || loading
                ? 'opacity-50'
                : 'hover:!bg-opacity-25 active:!bg-opacity-10',
              className ||
                (!disabled &&
                  !loading &&
                  'bg-primary hover:text-primary active:text-primary')
            )}
            disabled={disabled || loading}
            onClick={onClick}
          >
            {icon && (
              <Icon
                className={clsx(
                  'text-inherit',
                  title && (iconOnRight ? 'ml-2' : 'mr-2')
                )}
                {...iconProps}
                path={loading ? mdiLoading : (iconProps?.path ?? icon)}
                size={iconProps?.size ?? 0.75}
                spin={iconProps?.spin ?? loading}
              />
            )}
            <span
              className={clsx('block grow truncate', iconOnRight && '-order-1')}
            >
              {title}
            </span>
          </button>
        </li>
      </TooltipTrigger>
      {description && <TooltipContent>{description}</TooltipContent>}
    </Tooltip>
  )
}
