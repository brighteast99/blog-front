import { useLayoutEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { throttle } from 'throttle-debounce'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { selectBreakpoint, updateSize } from 'features/window/windowSlice'
import { Sidebar } from 'features/sidebar/Sidebar'
import { SidebarHandle } from 'features/sidebar/SidebarHandle'
import { CategoryPage } from 'pages/category'
import { MainPage } from 'pages/main'
import { Error } from 'components/Error'
import { PostPage } from 'pages/post'
import { EditPostPage } from 'pages/post/Edit'
import { LoginPage } from 'pages/login'
import { refreshToken, selectIsAuthenticated } from 'features/auth/authSlice'
import { AuthInfo } from 'types/auth'
import { ManagePage } from 'pages/manage'
import { ManageInfoPage } from 'pages/manage/info'
import { ManageCategoryPage } from 'pages/manage/Categories'
import { ManageTemplatePage } from 'pages/manage/Templates'

function App() {
  const dispatch = useAppDispatch()
  const isLoggedIn = useAppSelector(selectIsAuthenticated)
  const [refreshLoginTimer, setRefreshLoginTimer] =
    useState<ReturnType<typeof setInterval>>()
  const breakpoint = useAppSelector(selectBreakpoint)

  useLayoutEffect(() => {
    const dispatchSizeUpdate = throttle(250, () => {
      dispatch(
        updateSize({
          size: { height: window.innerHeight, width: window.innerWidth }
        })
      )
    })

    window.addEventListener('resize', dispatchSizeUpdate)

    return () => {
      window.removeEventListener('resize', dispatchSizeUpdate)
    }
  }, [dispatch])

  useLayoutEffect(() => {
    document.documentElement.style.fontSize =
      breakpoint === 'mobile' ? '12px' : '16px'
  }, [breakpoint])

  useLayoutEffect(() => {
    if (!isLoggedIn) {
      if (refreshLoginTimer) clearInterval(refreshLoginTimer)
      setRefreshLoginTimer(undefined)
      return
    }

    if (!refreshLoginTimer)
      setRefreshLoginTimer(
        setInterval(() => {
          dispatch(refreshToken(null)).then(({ payload }) => {
            let authInfo = payload as AuthInfo | undefined
            if (!authInfo) return
            if (localStorage.getItem('refreshToken'))
              localStorage.setItem('refreshToken', authInfo.refreshToken)
            else if (sessionStorage.getItem('refreshToken'))
              sessionStorage.setItem('refreshToken', authInfo.refreshToken)
          })
        }, 1000 * 290)
      )
  }, [dispatch, isLoggedIn, refreshLoginTimer])

  return (
    <div className='flex size-full min-h-[720px] bg-background text-foreground'>
      <Sidebar
        foldable={breakpoint !== 'desktop'}
        float={breakpoint === 'mobile'}
      />

      <div className='relative size-full min-w-0 flex-1 overflow-y-auto bg-background'>
        <div className='fixed z-40 h-full'>
          {breakpoint !== 'desktop' && (
            <SidebarHandle className='absolute inset-y-0 left-4 my-auto' />
          )}
        </div>

        <Routes>
          <Route path='/' element={<MainPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/manage' element={<ManagePage />}>
            <Route path='info' element={<ManageInfoPage />} />
            <Route path='categories' element={<ManageCategoryPage />} />
            <Route path='templates' element={<ManageTemplatePage />} />
          </Route>
          <Route path='/category/:categoryId?' element={<CategoryPage />} />
          <Route path='/post/new' element={<EditPostPage newPost />} />
          <Route path='/post/edit/:postId' element={<EditPostPage />} />
          <Route path='/post/:postId?' element={<PostPage />} />
          <Route
            path='/*'
            element={<Error code={404} message='유효하지 않은 페이지입니다' />}
          />
        </Routes>
      </div>
    </div>
  )
}

export default App
