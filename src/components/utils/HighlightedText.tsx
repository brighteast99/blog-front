import { useMemo } from 'react'

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
  highlightClass = 'font-bold text-primary',
  ...props
}) => {
  const content = useMemo(() => {
    let offset = 0
    const splittedText = [...(text ?? '')]
    let result: (string | ReactElement)[] = []

    if (
      truncateStart &&
      highlights?.length &&
      highlights[0][0] > BeforeFirstHighlight
    ) {
      offset = highlights[0][0] - BeforeFirstHighlight
      result.push('...')
    }

    for (const [start, end] of highlights ?? []) {
      result.push(splittedText.slice(offset, start).join(''))
      result.push(
        <span className={highlightClass} key={start}>
          {splittedText.slice(start, end).join('')}
        </span>
      )
      offset = end
    }

    const lastText = splittedText.slice(offset).join('')
    if (lastText.length) result.push(lastText)

    return result
  }, [text, highlights])

  return <p {...props}>{content}</p>
}
