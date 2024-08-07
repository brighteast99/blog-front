import clsx from 'clsx'

import styles from './ColorSelector.module.scss'

import type { DetailedHTMLProps, FC, HTMLAttributes } from 'react'

export const ColorPreview: FC<
  DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    active: boolean
  }
> = ({ color, active, ...props }) => {
  return (
    <button
      {...props}
      className={clsx(
        styles['color-preview'],
        active ? 'ring ring-primary' : 'hover:border-2 hover:border-primary'
      )}
      data-color={color}
      style={{ backgroundColor: color }}
    />
  )
}
