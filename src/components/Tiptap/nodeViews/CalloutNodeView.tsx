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

export const CalloutVariants = cva(
  'ml-2 border-l-[5px] bg-opacity-15 px-3 py-2.5 rounded my-4 border-opacity-75',
  {
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
      type: 'note'
    }
  }
)
export const CalloutTitleVariants = cva(
  'mb-5 flex items-center gap-2 text-lg font-semibold brightness-110',
  {
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
  }
)

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
      <div className={CalloutTitleVariants({ type })} contentEditable={false}>
        <Icon path={iconPath} size='1.25rem' />
        <span className='capitalize'>{type}</span>
      </div>
      <NodeViewContent />
    </NodeViewWrapper>
  )
}
