import { useCallback, useMemo, useRef } from 'react'

import { useToggle } from './useToggle'

import type { DragEvent } from 'react'

interface DropzoneProps {
  accept?: string
}

export const useDropzone = ({ accept }: DropzoneProps = {}) => {
  const {
    value: isDragging,
    setTrue: startDrag,
    setFalse: stopDrag
  } = useToggle(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      startDrag()
    },
    [startDrag]
  )

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!e.currentTarget.contains(e.relatedTarget as Node)) stopDrag()
    },
    [stopDrag]
  )

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      stopDrag()
      console.log('drop')

      if (!inputRef.current) return

      let files
      if (!accept) files = e.dataTransfer.files
      else {
        const filteredFiles = new DataTransfer()
        const types = accept.split(',')
        const acceptExts = types.filter((val) => val.startsWith('.'))
        const acceptMIMEs = types
          .filter((val) => val.includes('/'))
          .map((val) => RegExp(val))

        for (const file of e.dataTransfer.files)
          if (
            acceptExts.some((ext) => file.name.endsWith(ext)) ||
            acceptMIMEs.some((mime) => mime.test(file.type))
          )
            filteredFiles.items.add(file)
        files = filteredFiles.files
      }

      inputRef.current.files = files
      inputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
    },
    [stopDrag, inputRef, accept]
  )

  const dropzoneProps = useMemo(
    () => ({
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    }),
    [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]
  )

  return {
    isDragging,
    dropzoneProps,
    inputRef
  }
}
