import { FC, useLayoutEffect, Suspense, useCallback } from 'react'
import clsx from 'clsx'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { expand, selectSidebarIsFolded } from './sidebarSlice'
import { ErrorBoundary } from 'react-error-boundary'
import { Avatar } from 'components/Avatar'
import { Spinner } from 'components/Spinner'
import { CategoryList } from './CategoryList'
import { Error } from 'components/Error'
import {
  TypedDocumentNode,
  gql,
  useLoadableQuery,
  useQuery
} from '@apollo/client'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconButton } from 'components/Buttons/IconButton'
import { revokeToken, selectIsAuthenticated } from 'features/auth/authSlice'
import { mdiCog, mdiLogin, mdiLogout, mdiMenu } from '@mdi/js'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'
import { client } from 'ApolloContext'
import { PopoverMenu } from 'components/PopoverMenu'
import { PopoverMenuItem } from 'components/PopoverMenu/PopoverMenuItem'
import { BlogInfo } from 'types/data'
import { SuspendedText } from 'components/SuspendedText'

export type CategoryListQueryResult = { categoryList: string }

export const GET_INFO: TypedDocumentNode<{ blogInfo: BlogInfo }> = gql`
  query BlogInfo {
    blogInfo {
      title
      description
      avatar
    }
  }
`

export const GET_CATEGORIES: TypedDocumentNode<CategoryListQueryResult> = gql`
  query CategoryList {
    categoryList
  }
`

export interface SidebarProps {
  /**
   * Is sidebar foldable or not.
   * Mobile, Tablet: true / Desktop: False
   */
  foldable?: boolean
}

export const Sidebar: FC<SidebarProps> = ({ foldable = false }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isFolded = useAppSelector(selectSidebarIsFolded)
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const { data, loading: loadingInfo } = useQuery(GET_INFO, {
    notifyOnNetworkStatusChange: true
  })
  const [loadCategories, queryRef, { refetch: refetchCategories }] =
    useLoadableQuery(GET_CATEGORIES)

  const logIn = useCallback(() => {
    navigate(`/login?next=${location.pathname}`)
  }, [location.pathname, navigate])

  const logOut = useCallback(() => {
    if (window.confirm('로그아웃하시겠습니까?')) {
      dispatch(revokeToken(null)).then(() => {
        client.resetStore()
      })
      localStorage.removeItem('refreshToken')
      sessionStorage.removeItem('refreshToken')
    }
  }, [dispatch])

  useLayoutEffect(() => {
    if (!foldable && isFolded) dispatch(expand())
  }, [dispatch, foldable, isFolded])

  useLayoutEffect(() => {
    if (!queryRef) loadCategories()
  }, [queryRef, loadCategories])

  return (
    <div
      className={clsx(
        'h-full w-72 overflow-hidden bg-neutral-200 transition-[max-width,min-width]',
        isFolded ? 'min-w-0 max-w-0' : 'min-w-72 max-w-72'
      )}
    >
      <div className='mx-4 flex size-full w-64 flex-col py-8'>
        <Avatar
          className={clsx(
            'mb-2 shrink-0 self-center',
            loadingInfo && 'animate-pulse'
          )}
          size='2xl'
          imgSrc={data?.blogInfo.avatar}
        />
        <Link className='self-center' to='/'>
          <SuspendedText
            className='mb-1 text-lg font-semibold'
            loading={loadingInfo}
            text={data?.blogInfo.title}
            align='center'
            length={10}
          />
        </Link>
        <SuspendedText
          className='self-center'
          loading={loadingInfo}
          text={data?.blogInfo.description}
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
          <Tooltip placement='right'>
            <TooltipTrigger asChild>
              <IconButton
                className='w-fit'
                path={mdiLogin}
                color='primary'
                variant='hover-text'
                onClick={logIn}
              />
            </TooltipTrigger>
            <TooltipContent>로그인</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
