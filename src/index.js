import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ApolloContext } from 'ApolloContext'
import { store } from 'app/store'
import { setToken } from 'features/auth/authSlice.ts'
import { authFromStorage } from 'utils/Auth.ts'
import { RouterProvider } from 'react-router-dom'
import { router } from 'routes.tsx'
import 'index.scss'

const container = document.getElementById('root')
const root = createRoot(container)

let retry
do {
  try {
    retry = false
    let token = await authFromStorage()
    if (token) store.dispatch(setToken(token))
  } catch (err) {
    retry = window.confirm('로그인 중 오류가 발생했습니다.\n다시 시도할까요?')
  }
} while (retry)

root.render(
  // <React.StrictMode>
  <ApolloContext>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </ApolloContext>
  // </React.StrictMode>
)
