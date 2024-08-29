import { ApolloContext } from 'ApolloContext'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { router } from 'routes.tsx'

import { store } from 'store'
import { setToken } from 'store/slices/auth/authSlice'
import { authFromStorage } from 'utils/Auth.ts'

import 'index.scss'

if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
  document.documentElement.classList.add('safari')
}

const container = document.getElementById('root')
const root = createRoot(container)

let retry
do {
  try {
    retry = false
    let authInfo = await authFromStorage()
    if (authInfo) store.dispatch(setToken({ authInfo, keepLogin: true }))
  } catch (err) {
    retry = window.confirm('로그인 중 오류가 발생했습니다.\n다시 시도할까요?')
  }
} while (retry)

root.render(
  <ApolloContext>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </ApolloContext>
)
