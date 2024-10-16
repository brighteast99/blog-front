import type { FC, HTMLProps, ReactElement } from 'react'
import type { HighlightInterval } from 'types/data'

interface HighlightedTextProps {
  text?: string
  truncateStart?: boolean
  BeforeFirstHighlight?: number
  highlights?: HighlightInterval[]
  highlightClass?: string
}

export const HighlightedText: FC<
  HighlightedTextProps & HTMLProps<HTMLParagraphElement>
> = ({
  text = '',
  truncateStart = false,
  BeforeFirstHighlight = 100,
  highlights = [],
  highlightClass = 'font-bold text-success',
  ...props
}) => {
  let offset = 0
  let content: (string | ReactElement)[] = []

  if (truncateStart && highlights?.[0][0] > BeforeFirstHighlight) {
    offset = highlights[0][0] - BeforeFirstHighlight
    content.push('...')
  }

  for (const [start, end] of highlights ?? []) {
    content.push(text.slice(offset, start))
    content.push(
      <span className={highlightClass} key={start}>
        {text.slice(start, end)}
      </span>
    )
    offset = end
  }

  const remainingText = text.slice(offset)
  content.push(remainingText)

  return <p {...props}>{content}</p>
}
