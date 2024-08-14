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
import type { CodeBlockLanguage } from '../extensions/BetterCodeblock'

interface CodeBlockComponentProps extends NodeViewProps {}

export const BetterCodeBlockNodeView: FC<CodeBlockComponentProps> = ({
  node
}) => {
  const language: CodeBlockLanguage = node.attrs.language || 'plaintext'
  const [alertTimer, setAlertTimer] = useState<ReturnType<typeof setTimeout>>()

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent)
    setAlertTimer(setTimeout(() => setAlertTimer(undefined), 2000))
  }

  return (
    <NodeViewWrapper className='relative my-3 rounded-lg border border-neutral-100 bg-neutral-50 bg-opacity-90'>
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton
            className='absolute right-2 top-2 border border-solid border-neutral-100 hover:border-primary [&:not(:hover)]:opacity-50'
            variant='hover-text'
            path={mdiContentCopy}
            size={0.65}
            onClick={handleCopy}
          />
        </TooltipTrigger>
        <TooltipContent>
          {alertTimer ? '복사됨' : '클립보드에 복사'}
        </TooltipContent>
      </Tooltip>

      <pre className='overflow-x-auto text-white'>
        <NodeViewContent as='code' />
      </pre>

      <span className='absolute bottom-3 right-3 text-sm capitalize transition-colors [&:not(:hover)]:text-neutral-400'>
        {language}
      </span>
    </NodeViewWrapper>
  )
}
