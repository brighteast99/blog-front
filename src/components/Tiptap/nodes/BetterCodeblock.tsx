import React, { FC, useState } from 'react'

import { mdiContentCopy } from '@mdi/js'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import {
  NodeViewContent,
  NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer
} from '@tiptap/react'

import { IconButton } from 'components/Buttons/IconButton'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'

interface CodeBlockComponentProps extends NodeViewProps {}

const BetterCodeBlockComponent: FC<CodeBlockComponentProps> = ({ node }) => {
  const { language } = node.attrs
  const [alertTimer, setAlertTimer] = useState<ReturnType<typeof setTimeout>>()

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent)
    setAlertTimer(setTimeout(() => setAlertTimer(undefined), 2000))
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
          <TooltipContent>
            {alertTimer ? '복사됨' : '클립보드에 복사'}
          </TooltipContent>
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
