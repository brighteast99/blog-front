import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import clsx from 'clsx'

import type { CSSProperties } from 'react'
import type { NodeViewProps } from '@tiptap/react'

// Inspired/plagiarized from
// https://github.com/ueberdosis/tiptap/issues/333#issuecomment-1056434177
// First written by wwayne
// Edited by brighteast99

const useEvent = <T extends (...args: any[]) => any>(handler: T): T => {
  const handlerRef = useRef<T | null>(null)

  useLayoutEffect(() => {
    handlerRef.current = handler
  }, [handler])

  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    if (handlerRef.current === null) {
      throw new Error('Handler is not assigned')
    }
    return handlerRef.current(...args)
  }, []) as T
}

export const ResizableImageNodeView = ({
  node,
  editor,
  extension,
  updateAttributes
}: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [editing, setEditing] = useState(false)
  const [resizingStyle, setResizingStyle] = useState<
    Pick<CSSProperties, 'width'> | undefined
  >()
  const handleColor = useMemo(
    () => `bg-${extension.options.handleColor || 'primary'}`,
    [extension.options.handleColor]
  )

  // Lots of work to handle "not" div click events.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setEditing(false)
      }
    }
    // Add click event listener and remove on cleanup
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [editing])

  const handleMouseDown = useEvent(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!imgRef.current) return
      event.preventDefault()
      const direction = event.currentTarget.dataset.direction || '--'
      const initialXPosition = event.clientX
      const currentWidth = imgRef.current.width
      let newWidth = currentWidth
      const transform = direction[1] === 'w' ? -1 : 1

      const removeListeners = () => {
        window.removeEventListener('mousemove', mouseMoveHandler)
        window.removeEventListener('mouseup', removeListeners)
        updateAttributes({ width: newWidth })
        setResizingStyle(undefined)
      }

      const mouseMoveHandler = (event: MouseEvent) => {
        newWidth = Math.max(
          currentWidth + transform * (event.clientX - initialXPosition),
          extension.options.minWidth
        )
        setResizingStyle({ width: newWidth })
        // If mouse is up, remove event listeners
        if (!event.buttons) removeListeners()
      }

      window.addEventListener('mousemove', mouseMoveHandler)
      window.addEventListener('mouseup', removeListeners)
    }
  )

  const dragCornerButton = (direction: string) => (
    <div
      role='button'
      className={handleColor}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      data-direction={direction}
      style={{
        position: 'absolute',
        height: '10px',
        width: '10px',
        ...{ n: { top: 0 }, s: { bottom: 0 } }[direction[0]],
        ...{ w: { left: 0 }, e: { right: 0 } }[direction[1]],
        ...{
          nw: { transform: 'translate(-50%, -50%)' },
          ne: { transform: 'translate(50%, -50%)' },
          sw: { transform: 'translate(-50%, 50%)' },
          se: { transform: 'translate(50%, 50%)' }
        }[direction],
        cursor: `${direction}-resize`
      }}
    />
  )

  return (
    <NodeViewWrapper
      ref={containerRef}
      as='div'
      draggable
      data-drag-handle
      onClick={() => {
        if (editor.isEditable) setEditing(true)
      }}
      onBlur={() => setEditing(false)}
      style={
        extension.options.inline && {
          width: 'fit-content',
          display: 'inline-block'
        }
      }
    >
      <div
        className={clsx(editing && 'img-selected')}
        style={{
          overflow: 'visible',
          position: 'relative',
          display: 'inline-block',
          lineHeight: '0px'
        }}
      >
        <img
          {...node.attrs}
          alt={node.attrs.src}
          ref={imgRef}
          style={{
            ...resizingStyle,
            cursor: 'default'
          }}
        />
        {editing && (
          <>
            {[
              { left: -2, top: 0, height: '100%', width: '2px' },
              { right: -2, top: 0, height: '100%', width: '2px' },
              { top: -2, left: 0, width: '100%', height: '2px' },
              { bottom: -2, left: 0, width: '100%', height: '2px' }
            ].map((style, i) => (
              <div
                className={handleColor}
                key={i}
                style={{
                  position: 'absolute',
                  ...style
                }}
              />
            ))}
            {dragCornerButton('nw')}
            {dragCornerButton('ne')}
            {dragCornerButton('sw')}
            {dragCornerButton('se')}
          </>
        )}
      </div>
    </NodeViewWrapper>
  )
}
