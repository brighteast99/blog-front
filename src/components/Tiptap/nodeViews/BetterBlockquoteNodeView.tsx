import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'

import Icon from '@mdi/react'
import { mdiFormatQuoteClose, mdiFormatQuoteOpen } from '@mdi/js'

import type { FC } from 'react'
import type { NodeViewProps } from '@tiptap/react'

interface BlockquoteComponentProps extends NodeViewProps {}

export const BetterBlockquoteNodeView: FC<BlockquoteComponentProps> = () => {
  return (
    <NodeViewWrapper
      as='blockquote'
      className='relative mx-auto w-fit rounded bg-neutral-50 bg-opacity-75 px-10 py-6 text-center'
    >
      <Icon
        className='absolute left-1 top-1 text-foreground text-opacity-10'
        path={mdiFormatQuoteOpen}
        size='1.75rem'
      />
      <NodeViewContent as='span' />
      <Icon
        className='absolute right-1 top-1 text-foreground text-opacity-10'
        path={mdiFormatQuoteClose}
        size='1.5rem'
      />
    </NodeViewWrapper>
  )
}
