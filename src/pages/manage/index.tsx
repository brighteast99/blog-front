import { useEffect } from 'react'
import clsx from 'clsx'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAppSelector } from 'app/hooks'
import { selectIsAuthenticated } from 'features/auth/authSlice'

import type { FC } from 'react'

export const ManagePage: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const loggedIn = useAppSelector(selectIsAuthenticated)

  useEffect(() => {
    if (!loggedIn) navigate(`/login?next=${location.pathname}`)
  }, [navigate, loggedIn, location.pathname])

  useEffect(() => {
    if (location.pathname === '/manage')
      navigate('/manage/info', { replace: true })
  }, [location.pathname, navigate])

  return (
    <div className='flex h-dvh min-h-[720px] flex-col p-5'>
      <p className='mb-12 text-center text-4xl'>블로그 관리</p>
      <div className='flex border-b border-primary *:cursor-pointer *:rounded-t-sm *:px-3 *:py-1 *:text-xl'>
        <div
          className={clsx(
            location.pathname === '/manage/info' && 'bg-primary text-background'
          )}
        >
          <Link to='info'>블로그 정보</Link>
        </div>
        <div
          className={clsx(
            location.pathname === '/manage/categories' &&
              'bg-primary text-background'
          )}
        >
          <Link to='categories'>게시글 분류</Link>
        </div>
        <div
          className={clsx(
            location.pathname === '/manage/templates' &&
              'bg-primary text-background'
          )}
        >
          <Link to='templates'>게시글 템플릿</Link>
        </div>
      </div>
      <div className='grow p-2 *:h-full'>
        <Outlet />
      </div>
    </div>
  )
}
