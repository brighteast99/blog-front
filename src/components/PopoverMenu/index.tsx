import {
  FC,
  ReactNode,
  StyleHTMLAttributes,
  useLayoutEffect,
  useState
} from 'react'
import {
  autoUpdate,
  flip,
  FloatingDelayGroup,
  offset,
  Placement,
  useClick,
  useDismiss,
  useFloating,
  useInteractions
} from '@floating-ui/react'
import clsx from 'clsx'
import { mdiDotsVertical } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'
import { PopoverMenuItem } from './PopoverMenuItem'

export interface PopoverMenuProps {
  open?: boolean
  subMenu?: boolean
  menuBtn?: ReactNode
  placement?: Placement
  tooltipPlacement?: Placement
  icon?: string
  iconOnRight?: boolean
  size?: string | number
  offset?: number
  title?: string
  description?: string | boolean
  disabled?: boolean
  className?: string
  style?: StyleHTMLAttributes<HTMLDivElement>
  children?: ReactNode
  onClick?: () => any
  onOpen?: () => any
  onClose?: () => any
}

export const PopoverMenu: FC<PopoverMenuProps> = ({
  open: controlledOpen = false,
  subMenu = false,
  menuBtn,
  placement = 'left-start',
  tooltipPlacement = 'top',
  icon = mdiDotsVertical,
  iconOnRight = false,
  size = 0.8,
  offset: offsetValue = 5,
  title = '',
  description = '',
  disabled = false,
  className = '',
  style = {},
  children,
  onClick,
  onOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [emitOnCloseTimer, setEmitOnCloseTimer] =
    useState<ReturnType<typeof setTimeout>>()

  const { refs, floatingStyles, context } = useFloating({
    placement,
    open: isOpen,
    onOpenChange: (open) => {
      if (!open && typeof onClose === 'function') onClose()
      if (open && typeof onOpen === 'function') onOpen()
      setIsOpen(open)
    },
    whileElementsMounted: autoUpdate,
    middleware: [offset(offsetValue), flip({ padding: 10 })]
  })

  const click = useClick(context, {
    event: 'click'
  })
  const dismiss = useDismiss(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    dismiss,
    click
  ])

  useLayoutEffect(() => {
    if (disabled) setIsOpen(false)
  }, [disabled])

  useLayoutEffect(() => {
    setIsOpen(controlledOpen)
  }, [controlledOpen])

  useLayoutEffect(() => {
    // 메뉴 열린 상태에서 상위 메뉴가 닫혀서 언마운트될 때 실행될 수 있도록
    if (typeof onClose === 'function' && isOpen)
      return () =>
        setEmitOnCloseTimer(
          setTimeout(() => {
            onClose()
          })
        )
  }, [onClose, isOpen])

  useLayoutEffect(() => {
    clearTimeout(emitOnCloseTimer)
  }, [emitOnCloseTimer])

  return (
    <>
      <div
        ref={refs.setReference}
        className={clsx(!subMenu && className)}
        style={style}
        data-state={isOpen ? 'open' : 'closed'}
        {...getReferenceProps()}
      >
        {subMenu ? (
          <PopoverMenuItem
            icon={icon}
            iconOnRight={iconOnRight}
            title={title}
            description={description}
            tooltipPlacement={tooltipPlacement}
            disabled={disabled}
            onClick={onClick}
            className={className}
          />
        ) : (
          <Tooltip placement={tooltipPlacement}>
            <TooltipTrigger asChild>
              <div onClick={onClick}>
                {menuBtn || (
                  <IconButton
                    className={clsx(
                      'block h-fit p-1',
                      isOpen && '!opacity-100'
                    )}
                    variant='hover-text'
                    path={icon}
                    size={size}
                    disabled={!children || disabled}
                  />
                )}
              </div>
            </TooltipTrigger>
            {description && <TooltipContent>{description}</TooltipContent>}
          </Tooltip>
        )}
      </div>

      {isOpen && (
        <div
          ref={refs.setFloating}
          className='z-10 overflow-hidden rounded border border-neutral-100 bg-background text-foreground'
          style={{ ...floatingStyles }}
          {...getFloatingProps()}
        >
          <FloatingDelayGroup delay={{ open: 250, close: 100 }}>
            <ul>{children}</ul>
          </FloatingDelayGroup>
        </div>
      )}
    </>
  )
}
