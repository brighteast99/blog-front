import { useEffect } from 'react'
import clsx from 'clsx'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAppSelector } from 'store/hooks'
import { selectIsAuthenticated } from 'store/slices/auth/authSlice'

import { ManageCategoryPage } from './Categories'
import { ManageImagePage } from './Images'
import { ManageInfoPage } from './Info'
import { ManageTemplatePage } from './Templates'

import type { FC } from 'react'

export const MANAGE_ROUTES = [
  {
    path: '/manage/info',
    label: '블로그 정보',
    element: <ManageInfoPage />
  },
  {
    path: '/manage/categories',
    label: '게시글 분류',
    element: <ManageCategoryPage />
  },
  {
    path: '/manage/templates',
    label: '게시글 템플릿',
    element: <ManageTemplatePage />
  },
  {
    path: '/manage/images',
    label: '이미지 관리',
    element: <ManageImagePage />
  }
]

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
        {MANAGE_ROUTES.map(({ path, label }) => (
          <div
            key={path}
            className={clsx(
              location.pathname === path && 'bg-primary text-background'
            )}
          >
            <Link to={path}>{label}</Link>
          </div>
        ))}
      </div>
      <div className='min-h-0 grow p-2 *:h-full'>
        <Outlet />
      </div>
    </div>
  )
}
