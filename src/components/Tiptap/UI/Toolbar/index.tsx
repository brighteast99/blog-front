import { FloatingDelayGroup } from '@floating-ui/react'

import { cn } from 'utils/handleClassName'

import { NodeBlockTools } from './NodeBlockTools'
import { TextAlignTools } from './TextAlignTools'
import { TextDecorationTools } from './TextDecorationTools'
import { TextStyleTools } from './TextStyleTools'

import type { FC } from 'react'

export const Toolbar: FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center divide-x divide-neutral-400 border border-b-0 border-neutral-100 bg-neutral-100 bg-opacity-50 p-1',
        '*:flex *:items-center *:gap-1.5 *:px-2',
        className
      )}
    >
      <FloatingDelayGroup delay={{ open: 250, close: 100 }}>
        <TextStyleTools />
        <TextAlignTools />
        <TextDecorationTools />
        <NodeBlockTools />
      </FloatingDelayGroup>
    </div>
  )
}
