import { Suspense, useCallback, useLayoutEffect, useMemo } from 'react'
import { client } from 'ApolloContext'
import clsx from 'clsx'
import { ErrorBoundary } from 'react-error-boundary'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useLoadableQuery, useQuery } from '@apollo/client'
import { GET_CATEGORY_HIERARCHY } from 'pages/manage/Categories/api'
import { GET_INFO } from 'pages/manage/Info/api'

import { useAppDispatch, useAppSelector } from 'store/hooks'
import { revokeToken, selectIsAuthenticated } from 'store/slices/auth/authSlice'
import { updateBlogInfo } from 'store/slices/blog/blogSlice'

import { mdiCog, mdiLogin, mdiLogout, mdiMenu } from '@mdi/js'
import { Avatar } from 'components/Avatar'
import { IconButton } from 'components/Buttons/IconButton'
import { Error } from 'components/Error'
import { PopoverMenu } from 'components/PopoverMenu'
import { PopoverMenuItem } from 'components/PopoverMenu/PopoverMenuItem'
import { Spinner } from 'components/Spinner'
import { SuspendedText } from 'components/SuspendedText'
import { CategoryList } from './CategoryList'

import type { FC } from 'react'

export interface SidebarProps {
  foldable?: boolean
  isFolded?: boolean
  useScrim?: boolean
  foldOnLocationChange?: boolean
  fold?: (_?: any) => any
}

export const Sidebar: FC<SidebarProps> = ({
  foldable = false,
  isFolded = false,
  useScrim = false,
  foldOnLocationChange = false,
  fold
}) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const { data: blogInfoData, loading: loadingInfo } = useQuery(GET_INFO, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (blogInfo) => dispatch(updateBlogInfo(blogInfo))
  })
  const blogInfo = useMemo(() => blogInfoData?.blogInfo, [blogInfoData])
  const [loadCategories, queryRef, { refetch: refetchCategories }] =
    useLoadableQuery(GET_CATEGORY_HIERARCHY)

  const logIn = useCallback(
    () => navigate(`/login?next=${location.pathname}`),
    [location.pathname, navigate]
  )

  const logOut = useCallback(() => {
    if (window.confirm('로그아웃하시겠습니까?')) {
      dispatch(revokeToken(null)).then(() => client.resetStore())
    }
  }, [dispatch])

  useLayoutEffect(() => {
    if (!queryRef) loadCategories()
  }, [queryRef, loadCategories])

  useLayoutEffect(() => {
    if (foldOnLocationChange) fold?.()
  }, [foldOnLocationChange, location, fold])

  return (
    <>
      {foldable && useScrim && (
        <div
          id='scrim'
          className={clsx(
            'fixed z-40 h-lvh w-lvw bg-neutral-50 opacity-75 transition-opacity',
            isFolded && 'pointer-events-none !opacity-0'
          )}
          onClick={() => fold?.()}
        />
      )}
      <div
        className={clsx(
          'fixed z-50 flex h-dvh w-72 flex-col overflow-hidden bg-neutral-200 px-4 py-8 transition-transform',
          isFolded && '-translate-x-72'
        )}
      >
        <Avatar
          className={clsx(
            'mb-2 shrink-0 self-center',
            loadingInfo && 'animate-pulse'
          )}
          size='2xl'
          src={blogInfo?.avatar}
        />
        <Link className='self-center' to='/'>
          <SuspendedText
            className='mb-1 text-lg font-semibold'
            loading={loadingInfo}
            text={blogInfo?.title}
            align='center'
            length={10}
          />
        </Link>
        <SuspendedText
          className='self-center'
          loading={loadingInfo}
          text={blogInfo?.description}
          align='center'
          length={70}
          lines={2}
        />

        <hr className='mb-4 mt-2' />

        <div className='relative min-h-0 grow overflow-y-auto'>
          <ErrorBoundary
            FallbackComponent={({ resetErrorBoundary }) => (
              <Error
                message='오류가 발생했습니다'
                hideDefaultAction
                actions={[
                  {
                    label: '다시 시도',
                    handler: () => {
                      refetchCategories()
                      resetErrorBoundary()
                    }
                  }
                ]}
              />
            )}
          >
            <Suspense
              fallback={<Spinner size='sm' className='absolute inset-0' />}
            >
              {queryRef && <CategoryList queryRef={queryRef} />}
            </Suspense>
          </ErrorBoundary>
        </div>

        {isLoggedIn ? (
          <PopoverMenu className='w-fit self-end' icon={mdiMenu}>
            <PopoverMenuItem
              icon={mdiCog}
              title='블로그 관리'
              onClick={() => navigate('/manage/info')}
            />
            <PopoverMenuItem
              className='bg-error text-error'
              icon={mdiLogout}
              title='로그아웃'
              onClick={logOut}
            />
          </PopoverMenu>
        ) : (
          <IconButton
            className='w-fit'
            path={mdiLogin}
            color='primary'
            variant='hover-text'
            tooltip='로그인'
            onClick={logIn}
          />
        )}
      </div>
    </>
  )
}
