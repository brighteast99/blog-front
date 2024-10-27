import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { DialogProvider } from 'hooks/useDialog'
import { NavigationBlockerProvider } from 'hooks/useNavigationBlocker'

import { MANAGE_ROUTES } from 'pages/manage'
import { Error } from 'components/Error'
import { Spinner } from 'components/Spinner'

const App = lazy(() => import('App'))
const MainPage = lazy(() => import('./pages/main'))
const LoginPage = lazy(() => import('pages/login'))
const ManagePage = lazy(() => import('pages/manage'))
const CategoryPage = lazy(() => import('pages/category'))
const PostPage = lazy(() => import('pages/post'))
const EditPostPage = lazy(() => import('pages/post/Edit'))

export const router = createBrowserRouter([
  {
    element: (
      <Suspense
        fallback={
          <div className='relative h-dvh w-dvw bg-neutral-50 bg-opacity-50'>
            <Spinner className='absolute inset-0' size='2xl' />
          </div>
        }
      >
        <NavigationBlockerProvider>
          <DialogProvider>
            <App />
          </DialogProvider>
        </NavigationBlockerProvider>
      </Suspense>
    ),
    children: [
      { path: '/', element: <MainPage /> },
      { path: '/login', element: <LoginPage /> },
      {
        path: '/manage',
        element: <ManagePage />,
        children: MANAGE_ROUTES
      },
      { path: '/category/:categoryId?', element: <CategoryPage /> },
      { path: '/post/new', element: <EditPostPage newPost /> },
      { path: '/post/edit/:postId', element: <EditPostPage /> },
      { path: '/post/:postId?', element: <PostPage /> },
      {
        path: '/*',
        element: <Error code={404} message='유효하지 않은 페이지입니다' />
      }
    ]
  }
])
