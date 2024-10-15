import type { FC, HTMLProps, ReactElement } from 'react'

interface HighlightedTextProps {
  text?: string
  truncateStart?: boolean
  BeforeFirstHighlight?: number
  highlights?: number[][]
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
  const splittedText = [...(text ?? '')]
  let content: (string | ReactElement)[] = []

  if (
    truncateStart &&
    highlights?.length &&
    highlights[0][0] > BeforeFirstHighlight
  ) {
    offset = highlights[0][0] - BeforeFirstHighlight
    content.push('...')
  }

  for (const [start, end] of highlights ?? []) {
    content.push(splittedText.slice(offset, start).join(''))
    content.push(
      <span className={highlightClass} key={start}>
        {splittedText.slice(start, end).join('')}
      </span>
    )
    offset = end
  }

  const lastText = splittedText.slice(offset).join('')
  if (lastText.length) content.push(lastText)

  return <p {...props}>{content}</p>
}
