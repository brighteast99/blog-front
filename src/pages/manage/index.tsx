import { useEffect } from 'react'
import clsx from 'clsx'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAppSelector } from 'store/hooks'
import { selectIsAuthenticatedAndActive } from 'store/slices/auth/authSlice'

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

const ManagePage: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const loggedIn = useAppSelector(selectIsAuthenticatedAndActive)

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
      <div className='flex rounded-t border-b border-primary bg-neutral-100 *:cursor-pointer *:rounded-t-sm *:px-3 *:py-1.5 *:text-xl'>
        {MANAGE_ROUTES.map(({ path, label }) => (
          <div
            key={path}
            className={clsx(
              location.pathname === path &&
                'bg-primary font-semibold *:!text-background'
            )}
          >
            <Link to={path}>{label}</Link>
          </div>
        ))}
        <div className='shrink grow' />
        <Link to={`${window.location.origin}/api`} target='_blank'>
          API test
        </Link>
        <Link to={`${window.location.origin}/admin`} target='_blank'>
          Admin page
        </Link>
      </div>
      <div className='min-h-0 grow rounded-b bg-neutral-50 *:h-full'>
        <Outlet />
      </div>
    </div>
  )
}

export default ManagePage
