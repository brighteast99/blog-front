import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
  useState
} from 'react'
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDelayGroup,
  useDelayGroupContext,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStyles
} from '@floating-ui/react'
import clsx from 'clsx'

import type { HTMLProps, ReactNode } from 'react'
import type { Placement } from '@floating-ui/react'

export type TooltipDelay = number | { open?: number; close?: number }

export interface TooltipOptions {
  initialOpen?: boolean
  placement?: Placement
  offset?: number
  open?: boolean
  delay?: TooltipDelay
  onOpenChange?: (open: boolean) => void
}
export function useTooltip({
  initialOpen = false,
  placement = 'top',
  offset: offsetValue = 5,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  delay: individualDelay = { open: 250, close: 100 }
}: TooltipOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = setControlledOpen ?? setUncontrolledOpen

  const { delay } = useDelayGroupContext()

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [offset(offsetValue), flip(), shift()]
  })

  const context = data.context

  const hover = useHover(context, {
    move: false,
    enabled: controlledOpen == null,
    delay: delay || individualDelay
  })
  const focus = useFocus(context, {
    enabled: controlledOpen == null
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const interactions = useInteractions([hover, focus, dismiss, role])

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data
    }),
    [open, setOpen, interactions, data]
  )
}

type ContextType = ReturnType<typeof useTooltip> | null

const TooltipContext = createContext<ContextType>(null)

export const useTooltipContext = () => {
  const context = useContext(TooltipContext)

  if (context == null) {
    throw new Error('Tooltip components must be wrapped in <Tooltip />')
  }

  return context
}

export function Tooltip({
  children,
  ...options
}: { children: ReactNode } & TooltipOptions) {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const tooltip = useTooltip(options)
  return (
    <TooltipContext.Provider value={tooltip}>
      {children}
    </TooltipContext.Provider>
  )
}

export const TooltipTrigger = forwardRef<
  HTMLElement,
  HTMLProps<HTMLElement> & { asChild?: boolean }
>(function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
  const state = useTooltipContext()

  const childrenRef = (children as any).ref
  const ref = useMergeRefs([state.refs.setReference, propRef, childrenRef])

  // `asChild` allows the user to pass any element as the anchor
  if (asChild && isValidElement(children)) {
    return cloneElement(
      children,
      state.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        'data-state': state.open ? 'open' : 'closed'
      })
    )
  }

  return (
    <button
      ref={ref}
      // The user can style the trigger based on the state
      data-state={state.open ? 'open' : 'closed'}
      {...state.getReferenceProps(props)}
    >
      {children}
    </button>
  )
})

export const TooltipContent = forwardRef<
  HTMLDivElement,
  HTMLProps<HTMLDivElement>
>(function TooltipContent(props, propRef) {
  const state = useTooltipContext()
  const { isInstantPhase, currentId } = useDelayGroupContext()
  const ref = useMergeRefs([state.refs.setFloating, propRef])

  useDelayGroup(state.context, { id: state.context.floatingId })

  const instantDuration = 0
  const duration = 250

  const { isMounted, styles } = useTransitionStyles(state.context, {
    duration: isInstantPhase
      ? {
          open: instantDuration,
          // `id` is this component's `id`
          // `currentId` is the current group's `id`
          close:
            currentId === state.context.floatingId ? duration : instantDuration
        }
      : duration,
    initial: {
      opacity: 0
    }
  })

  if (!isMounted) return null

  return (
    <FloatingPortal>
      <div
        ref={ref}
        className={clsx(
          'pointer-events-none z-10 w-fit rounded bg-neutral-950/80 px-1 py-0.5 text-neutral-50',
          props.className
        )}
        style={{
          ...state.floatingStyles,
          ...props.style,
          ...styles
        }}
        {...state.getFloatingProps(props)}
      />
    </FloatingPortal>
  )
})
