import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { FloatingDelayGroup } from '@floating-ui/react'
import { NodeViewWrapper } from '@tiptap/react'

import { mdiMagnifyExpand, mdiOpenInNew } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { useImageViewer } from 'components/ImageViewer'

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
  updateAttributes,
  selected
}: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const focused = useMemo(
    () => editor.isEditable && selected,
    [editor.isEditable, selected]
  )
  const [resizingStyle, setResizingStyle] = useState<
    Pick<CSSProperties, 'width'> | undefined
  >()
  const { Viewer, open } = useImageViewer(node.attrs.src)

  const handleMouseDown = useEvent((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return

    e.preventDefault()
    const direction = e.currentTarget.dataset.direction || '--'
    const initialXPosition = e.clientX
    const currentWidth = imgRef.current.width
    let newWidth = currentWidth
    const transform = direction === 'w' ? -1 : 1

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
  })

  const dragCornerButton = (direction: string) => (
    <div
      role='button'
      className='rounded bg-primary opacity-25 transition-opacity group-hover/handles:opacity-100'
      tabIndex={0}
      onMouseDown={handleMouseDown}
      data-direction={direction}
      style={{
        position: 'absolute',
        height: '50%',
        width: '6px',
        top: '0',
        bottom: '0',
        ...{ w: { left: -10 }, e: { right: -10 } }[direction],
        ...{
          w: { transform: 'translate(-50%, 50%)' },
          e: { transform: 'translate(50%, 50%)' }
        }[direction],
        cursor: `ew-resize`
      }}
    />
  )

  return (
    <NodeViewWrapper
      ref={containerRef}
      as='div'
      draggable
      data-drag-handle
      style={
        extension.options.inline && {
          width: 'fit-content',
          display: 'inline-block'
        }
      }
    >
      <div
        className='group/image'
        style={{
          overflow: 'visible',
          position: 'relative',
          display: 'inline-block',
          lineHeight: '0px'
        }}
      >
        {!focused && <Viewer />}
        {!editor.isEditable && (
          <div className='absolute right-2 top-2 flex size-fit gap-2 opacity-0 *:backdrop-blur-sm *:backdrop-brightness-75 group-hover/image:opacity-100'>
            <FloatingDelayGroup delay={0}>
              <IconButton
                path={mdiMagnifyExpand}
                tooltip='원본 크기 보기'
                variant='hover-text-toggle'
                size={1.2}
                active={true}
                onClick={open}
              />
              <IconButton
                path={mdiOpenInNew}
                tooltip='새 탭에서 이미지 열기'
                variant='hover-text-toggle'
                size={1.2}
                active={true}
                onClick={() => window.open(node.attrs.src, '_blank')}
              />
            </FloatingDelayGroup>
          </div>
        )}
        <img
          {...node.attrs}
          alt={node.attrs.src}
          ref={imgRef}
          style={{
            ...resizingStyle,
            cursor: 'default'
          }}
        />
        {focused && (
          <div className='group/handles contents'>
            {dragCornerButton('w')}
            {dragCornerButton('e')}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
