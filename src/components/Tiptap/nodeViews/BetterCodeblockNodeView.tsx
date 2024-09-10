import { useLayoutEffect, useRef } from 'react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import clsx from 'clsx'
import { debounce } from 'throttle-debounce'

import { CopyButton } from 'components/Buttons/CopyButton'

import type { FC } from 'react'
import type { NodeViewProps } from '@tiptap/react'
import type { CodeBlockLanguage } from '../extensions/BetterCodeblock'

interface CodeBlockComponentProps extends NodeViewProps {}

export const BetterCodeBlockNodeView: FC<CodeBlockComponentProps> = ({
  node,
  extension,
  updateAttributes
}) => {
  const language: CodeBlockLanguage = node.attrs.language || 'plaintext'
  const codeblockRef = useRef<HTMLPreElement>(null)

  useLayoutEffect(() => {
    if (!extension.options.resizable || !codeblockRef?.current) return

    const debouncedUpdateAttributes = debounce(100, (attr) =>
      updateAttributes(attr)
    )

    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const entry = entries.pop()
      if (!entry) return
      const target = entry.target as HTMLElement
      const maxHeight = (target.firstChild as Element).clientHeight

      if (entry.contentRect.height >= maxHeight) {
        if (!target.style.height) return
        observer.disconnect()
        target.style.height = ''
        debouncedUpdateAttributes({ height: '' })
        requestAnimationFrame(() => {
          observer.observe(codeblockRef.current as Element)
        })
      } else
        debouncedUpdateAttributes({
          height: entry.contentRect.height
        })
    })

    observer.observe(codeblockRef.current)

    return () => observer.disconnect()
  }, [extension.options.resizable, updateAttributes])

  return (
    <NodeViewWrapper className='relative my-3 rounded-lg border border-neutral-100 bg-neutral-50 bg-opacity-90'>
      <CopyButton
        className='absolute right-3 top-2 border border-solid border-neutral-100 hover:border-primary [&:not(:hover)]:opacity-50'
        content={node.textContent}
        size={0.65}
      />
      <div className='overflow-y-auto'>
        <pre
          ref={codeblockRef}
          className={clsx(
            'overflow-x-auto text-white',
            extension.options.resizable && 'resize-y'
          )}
          style={{
            height: node.attrs.height,
            minHeight: extension.options.minHeight
          }}
        >
          <NodeViewContent as='code' />
        </pre>
      </div>

      <span className='absolute bottom-3 right-4 text-sm capitalize transition-colors [&:not(:hover)]:text-neutral-400'>
        {language}
      </span>
    </NodeViewWrapper>
  )
}
