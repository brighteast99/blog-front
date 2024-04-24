import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ApolloContext } from 'ApolloContext'
import { store } from 'app/store'
import { loadAuthInfoFromStorage, refreshToken } from 'utils/Auth.ts'
import { setToken } from 'features/auth/authSlice.ts'
import { isPast } from 'utils/dayJS.ts'
import App from './App.tsx'
import 'index.scss'

const container = document.getElementById('root')
const root = createRoot(container)

let token = await loadAuthInfoFromStorage()
if (token) {
  if (!isPast(token.refreshExpiresIn * 1000)) {
    if (isPast(token.payload.exp * 1000)){
      try  {
        token = await refreshToken(token.token)
        localStorage.setItem('token', token.token)
      } catch(err) {
        //
      }
    }

    store.dispatch(setToken(token))
  }
}

root.render(
  <React.StrictMode>
    <ApolloContext>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ApolloContext>
  </React.StrictMode>
)
