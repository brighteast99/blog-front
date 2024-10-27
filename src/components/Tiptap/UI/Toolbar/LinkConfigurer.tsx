import { useEffect, useState } from 'react'
import clsx from 'clsx'

import Icon from '@mdi/react'
import { mdiOpenInNew } from '@mdi/js'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { PopoverMenu } from 'components/PopoverMenu'

import type { ChangeEvent, FC, FormEvent, ReactNode } from 'react'
import type { Placement } from '@floating-ui/react'

const urlRegex = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/

export type LinkInfo = {
  href: string
  title: string
  valid: boolean
}

interface LinkConfigurerProps {
  className?: string
  active?: boolean
  placement?: Placement
  tooltipPlacement?: Placement
  href?: string
  title?: string
  description?: string
  children?: ReactNode
  onChange: (data: LinkInfo) => any
  onDelete: () => any
}

export const LinkConfigurer: FC<LinkConfigurerProps> = ({
  className = '',
  active = false,
  placement = 'bottom-end',
  tooltipPlacement = 'bottom',
  href = '',
  title = '',
  description = '',
  onChange = () => {},
  onDelete = () => {},
  children
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [input, setInput] = useState<LinkInfo>({
    href,
    title,
    valid: urlRegex.test(href)
  })

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput((prevState) => {
      let newState = { ...prevState }

      if (e.target.name === 'title') newState.title = e.target.value
      if (e.target.name === 'href') {
        newState.href = e.target.value
        newState.valid = urlRegex.test(newState.href)
      }
      return newState
    })
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (typeof onChange === 'function') onChange(input)
    setIsOpen(false)
  }

  const onClickDelete = () => {
    if (typeof onDelete === 'function') onDelete()
    setIsOpen(false)
  }

  useEffect(() => {
    setInput({
      href,
      title,
      valid: urlRegex.test(href)
    })
  }, [href, title])

  return (
    <PopoverMenu
      className={className}
      open={isOpen}
      placement={placement}
      offset={10}
      tooltipPlacement={tooltipPlacement}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      menuBtn={
        children || <button>{`링크 ${active ? '편집' : '생성'}`}</button>
      }
      description={description}
    >
      <div className='w-72 p-2'>
        <form onSubmit={onSubmit}>
          <input
            className='mb-2 w-full'
            name='title'
            type='text'
            required
            value={input.title}
            placeholder='링크 제목'
            onChange={onInputChange}
          />
          <input
            className='mb-2 w-full'
            name='href'
            type='url'
            value={input.href}
            pattern='https?://.*'
            placeholder='링크 주소'
            onChange={onInputChange}
          />

          <a
            href={input.href}
            rel='noreferrer noopener'
            target='_blank'
            className={clsx(
              'mt-2.5 inline-block text-sm text-secondary',
              !input.valid && 'pointer-events-none brightness-50'
            )}
          >
            <Icon
              className='mr-1 inline align-middle'
              path={mdiOpenInNew}
              size='14px'
            />
            URL로 이동
          </a>

          <ThemedButton
            color='primary'
            type='submit'
            className='float-right px-2 py-1'
            disabled={input.title.length === 0 || !input.valid}
          >
            확인
          </ThemedButton>
          {active && (
            <ThemedButton
              type='button'
              color='error'
              variant='text'
              className='float-right mr-1 p-1'
              onClick={onClickDelete}
            >
              링크 삭제
            </ThemedButton>
          )}
        </form>
      </div>
    </PopoverMenu>
  )
}
