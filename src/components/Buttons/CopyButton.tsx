import { useCallback, useState } from 'react'

import { cn } from 'utils/handleClassName'

import { mdiContentCopy } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

import type { FC } from 'react'

export const CopyButton: FC<{
  className?: string
  content: string
  size?: string | number
}> = ({ className, content, size }) => {
  const [alertTimer, setAlertTimer] = useState<ReturnType<typeof setTimeout>>()

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
    setAlertTimer(setTimeout(() => setAlertTimer(undefined), 2000))
  }, [content])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton
          className={cn(className)}
          variant='hover-text'
          path={mdiContentCopy}
          size={size}
          onClick={handleCopy}
        />
      </TooltipTrigger>
      <TooltipContent>
        {alertTimer ? '복사됨' : '클립보드에 복사'}
      </TooltipContent>
    </Tooltip>
  )
}
