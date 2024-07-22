import { mdiAlertOutline } from '@mdi/js'
import Icon from '@mdi/react'
import { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorProps } from 'types/error'

export interface Action {
  label: string
  href?: {
    to: string
    option?: {
      replace?: boolean
    }
  }
  handler?: () => any
}

export const Error: FC<
  ErrorProps & {
    actions?: Action[]
    hideDefaultAction?: boolean
  }
> = ({
  code,
  message = '오류가 발생했습니다',
  actions = [],
  hideDefaultAction = false
}) => {
  const navigate = useNavigate()

  return (
    <div className='flex size-full flex-col items-center justify-center'>
      {code !== undefined ? (
        <p className='mb-1 text-8xl font-semibold text-neutral-700'>{code}</p>
      ) : (
        <Icon path={mdiAlertOutline} size={5} />
      )}
      <p className='mb-4 text-xl'>{message}</p>
      <div className='flex gap-2 *:rounded *:bg-neutral-400 *:px-1.5 *:py-1'>
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              if (action.handler) action.handler()
              if (action.href) navigate(action.href.to, action.href.option)
            }}
          >
            {action.label}
          </button>
        ))}
        {!hideDefaultAction && (
          <button>
            <Link to='/'>메인으로 이동</Link>
          </button>
        )}
      </div>
    </div>
  )
}
