import { useMemo } from 'react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { cva } from 'class-variance-authority'

import Icon from '@mdi/react'
import {
  mdiAlert,
  mdiCheckBold,
  mdiCloseOctagon,
  mdiHelp,
  mdiInformationSlabCircle,
  mdiPencil
} from '@mdi/js'

import type { FC } from 'react'
import type { NodeViewProps } from '@tiptap/react'
import type { CalloutType } from 'components/Tiptap/extensions/Callout'

interface CalloutComponentProps extends NodeViewProps {}

export const CalloutVariants = cva('ml-2 border-l-4 bg-opacity-10 p-4', {
  variants: {
    type: {
      note: 'border-primary bg-primary',
      info: 'border-info bg-info',
      success: 'border-success bg-success',
      question: 'border-teal-800 bg-teal-800',
      caution: 'border-warning bg-warning',
      warning: 'border-error bg-error'
    }
  },
  defaultVariants: {
    type: 'info'
  }
})
export const CalloutIconVariants = cva('brightness-110', {
  variants: {
    type: {
      note: 'text-primary',
      info: 'text-info',
      success: 'text-success',
      question: 'text-teal-800',
      caution: 'text-warning',
      warning: 'text-error'
    }
  },
  defaultVariants: {
    type: 'note'
  }
})

export const CalloutNodeView: FC<CalloutComponentProps> = ({ node }) => {
  const type: CalloutType = node.attrs.type || 'info'
  const iconPath = useMemo(() => {
    switch (type) {
      case 'note':
        return mdiPencil
      case 'info':
        return mdiInformationSlabCircle
      case 'question':
        return mdiHelp
      case 'success':
        return mdiCheckBold
      case 'caution':
        return mdiAlert
      case 'warning':
        return mdiCloseOctagon
    }
  }, [type])

  return (
    <NodeViewWrapper as='blockquote' className={CalloutVariants({ type })}>
      <div className='mb-5 flex items-center gap-2' contentEditable={false}>
        <Icon
          className={CalloutIconVariants({ type })}
          path={iconPath}
          size='1.75rem'
        />
        <span className='text-xl font-bold capitalize'>{type}</span>
      </div>
      <NodeViewContent />
    </NodeViewWrapper>
  )
}
