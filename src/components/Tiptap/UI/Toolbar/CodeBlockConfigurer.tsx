import { useLayoutEffect, useState } from 'react'

import { useToggle } from 'hooks/useToggle'

import { ThemedButton } from 'components/Buttons/ThemedButton'
import { PopoverMenu } from 'components/PopoverMenu'
import { languages } from 'components/Tiptap/extensions/BetterCodeblock'

import type { FC, FormEvent, ReactNode } from 'react'
import type { Placement } from '@floating-ui/react'

interface CodeBlockConfigurerProps {
  className?: string
  active?: boolean
  placement?: Placement
  tooltipPlacement?: Placement
  language?: string
  description?: string
  children?: ReactNode
  onChange: (language: string) => any
  onDelete: () => any
}

export const CodeBlockConfigurer: FC<CodeBlockConfigurerProps> = ({
  className = '',
  active = false,
  placement = 'bottom-end',
  tooltipPlacement = 'bottom',
  language: _language = 'bash',
  description = '',
  onChange = () => {},
  onDelete = () => {},
  children
}) => {
  const { value: isOpen, setFalse: close, setTrue: open } = useToggle(false)
  const [language, setLanguage] = useState<string>(_language)

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (typeof onChange === 'function') onChange(language)
    close()
  }

  const onClickDelete = () => {
    if (typeof onDelete === 'function') onDelete()
    close()
  }

  useLayoutEffect(() => {
    setLanguage(_language)
  }, [_language])

  return (
    <PopoverMenu
      className={className}
      open={isOpen}
      placement={placement}
      offset={10}
      tooltipPlacement={tooltipPlacement}
      onOpen={open}
      onClose={close}
      menuBtn={
        children || <button>{`코드 블록 ${active ? '편집' : '삽입'}`}</button>
      }
      description={description}
    >
      <div className='w-72 p-2'>
        <form onSubmit={onSubmit}>
          <div className='flex gap-2'>
            <select
              autoFocus
              className='grow'
              name='language'
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map(({ name, value }) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
            <ThemedButton color='primary' type='submit' className='px-2 py-1'>
              확인
            </ThemedButton>
          </div>

          {active && (
            <ThemedButton
              type='button'
              color='error'
              variant='text'
              className='mt-2 block w-full p-1'
              onClick={onClickDelete}
            >
              블록 삭제
            </ThemedButton>
          )}
        </form>
      </div>
    </PopoverMenu>
  )
}
