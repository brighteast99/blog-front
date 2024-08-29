import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'

import { CopyButton } from 'components/Buttons/CopyButton'

import type { FC } from 'react'
import type { NodeViewProps } from '@tiptap/react'
import type { CodeBlockLanguage } from '../extensions/BetterCodeblock'

interface CodeBlockComponentProps extends NodeViewProps {}

export const BetterCodeBlockNodeView: FC<CodeBlockComponentProps> = ({
  node
}) => {
  const language: CodeBlockLanguage = node.attrs.language || 'plaintext'

  return (
    <NodeViewWrapper className='relative my-3 rounded-lg border border-neutral-100 bg-neutral-50 bg-opacity-90'>
      <CopyButton
        className='absolute right-2 top-2 border border-solid border-neutral-100 hover:border-primary [&:not(:hover)]:opacity-50'
        content={node.textContent}
        size={0.65}
      />

      <pre className='overflow-x-auto text-white'>
        <NodeViewContent as='code' />
      </pre>

      <span className='absolute bottom-3 right-3 text-sm capitalize transition-colors [&:not(:hover)]:text-neutral-400'>
        {language}
      </span>
    </NodeViewWrapper>
  )
}
