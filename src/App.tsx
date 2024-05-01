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
        }, 1000 * 270)
      )
  }, [dispatch, isLoggedIn, refreshLoginTimer])

  return (
    <div className='flex size-full min-h-[720px] bg-background text-foreground'>
      <Sidebar foldable={breakpoint !== 'desktop'} />

      <div className='relative h-full min-w-120 shrink grow'>
        <Routes>
          <Route path='/' element={<MainPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/category/:categoryId?' element={<CategoryPage />} />
          <Route path='/post/new' element={<EditPostPage newPost />} />
          <Route path='/post/edit/:postId' element={<EditPostPage />} />
          <Route path='/post/:postId?' element={<PostPage />} />
          <Route
            path='/*'
            element={<Error code={404} message='유효하지 않은 페이지입니다' />}
          />
        </Routes>

        {breakpoint !== 'desktop' && (
          <SidebarHandle className='absolute inset-y-0 left-4 my-auto' />
        )}
      </div>
    </div>
  )
}

export default App
