import React, { FC } from 'react'
import {
  NodeViewWrapper,
  NodeViewContent,
  ReactNodeViewRenderer,
  NodeViewProps
} from '@tiptap/react'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { IconButton } from 'components/Buttons/IconButton'
import { mdiContentCopy } from '@mdi/js'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'

interface CodeBlockComponentProps extends NodeViewProps {}

const BetterCodeBlockComponent: FC<CodeBlockComponentProps> = ({ node }) => {
  const { language } = node.attrs

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent)
    alert('클립보드에 복사됨')
  }

  return (
    <NodeViewWrapper className='my-3 overflow-hidden rounded-lg'>
      <div className='flex items-center justify-between bg-neutral-100 px-4 py-3'>
        <span className='capitalize'>{language}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton
              variant='hover-text'
              path={mdiContentCopy}
              size={0.7}
              onClick={handleCopy}
            />
          </TooltipTrigger>
          <TooltipContent>클립보드에 복사</TooltipContent>
        </Tooltip>
      </div>
      <pre>
        <NodeViewContent as='code' />
      </pre>
    </NodeViewWrapper>
  )
}

export const BetterCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(BetterCodeBlockComponent)
  }
})
