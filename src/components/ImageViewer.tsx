import { useCallback, useLayoutEffect, useState } from 'react'
import { FloatingOverlay } from '@floating-ui/react'

import { mdiClose } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'

import type { FC } from 'react'

export const useImageViewer = (src?: string) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const Viewer = () => (
    <ImageViewer src={src} open={isOpen} onClickClose={close} />
  )

  return { Viewer, open, close }
}

export const ImageViewer: FC<{
  src?: string
  open?: boolean
  onClickClose?: (_?: any) => any
}> = ({ src, open, onClickClose }) => {
  useLayoutEffect(() => {
    if (!open) return

    const handleDismiss = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      if (['Escape', 'Backspace'].includes(e.key)) return onClickClose?.()
    }

    window.addEventListener('keydown', handleDismiss)

    return () => {
      window.removeEventListener('keydown', handleDismiss)
    }
  }, [open, onClickClose])

  if (!open) return null
  return (
    <FloatingOverlay
      className='z-50 bg-neutral-50 bg-opacity-80'
      lockScroll
      onClick={onClickClose}
    >
      <IconButton
        className='absolute right-3 top-3'
        color='error'
        variant='hover-text'
        path={mdiClose}
        size={1.5}
        tooltip='닫기'
        onClick={onClickClose}
      />
      <img
        className='absolute inset-0 m-auto block max-h-[80dvh] !max-w-[80dvw] border-2 border-primary border-opacity-50 bg-background'
        src={src}
        alt='preview'
      />
    </FloatingOverlay>
  )
}
