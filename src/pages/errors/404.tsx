import { FC } from 'react'
import { Link } from 'react-router-dom'
import { ErrorProps } from 'types/error'

export const Error404: FC<ErrorProps> = ({
  message = '페이지를 찾을 수 없습니다',
  action
}) => {
  return (
    <div className='flex size-full flex-col items-center justify-center'>
      <p className='mb-1 text-8xl font-semibold text-neutral-700'>404</p>
      <p className='mb-4 text-xl'>{message}</p>
      <div className='flex gap-2 *:rounded *:bg-neutral-400 *:px-1.5 *:py-1'>
        {action && (
          <button>
            <Link to={action.to}>{action.label}</Link>
          </button>
        )}
        <button>
          <Link to='/'>메인으로 이동</Link>
        </button>
      </div>
    </div>
  )
}
