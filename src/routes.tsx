import App from 'App'
import { createBrowserRouter } from 'react-router-dom'

import { CategoryPage } from 'pages/category'
import { LoginPage } from 'pages/login'
import { MainPage } from 'pages/main'
import { ManagePage } from 'pages/manage'
import { ManageCategoryPage } from 'pages/manage/Categories'
import { ManageInfoPage } from 'pages/manage/Info'
import { ManageTemplatePage } from 'pages/manage/Templates'
import { PostPage } from 'pages/post'
import { EditPostPage } from 'pages/post/Edit'
import { Error } from 'components/Error'

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <MainPage />
      },
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/manage',
        element: <ManagePage />,
        children: [
          {
            path: '/manage/info',
            element: <ManageInfoPage />
          },
          {
            path: '/manage/categories',
            element: <ManageCategoryPage />
          },
          {
            path: '/manage/templates',
            element: <ManageTemplatePage />
          }
        ]
      },
      {
        path: '/category/:categoryId?',
        element: <CategoryPage />
      },
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
