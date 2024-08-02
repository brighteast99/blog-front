import { useState } from 'react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'

import { mdiContentCopy } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

import type { FC } from 'react'
import type { NodeViewProps } from '@tiptap/react'

interface CodeBlockComponentProps extends NodeViewProps {}

export const BetterCodeBlockNodeView: FC<CodeBlockComponentProps> = ({
  node
}) => {
  const { language } = node.attrs
  const [alertTimer, setAlertTimer] = useState<ReturnType<typeof setTimeout>>()

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent)
    setAlertTimer(setTimeout(() => setAlertTimer(undefined), 2000))
  }

  return (
    <NodeViewWrapper className='my-3 overflow-hidden rounded-lg'>
      <div className='flex items-center justify-between bg-neutral-200 px-4 py-3'>
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
