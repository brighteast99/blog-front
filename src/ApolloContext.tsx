import { PropsWithChildren } from 'react'
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache
} from '@apollo/client'
import { store } from 'app/store'
import { isFuture } from 'utils/dayJS'

const httpLink = new HttpLink({ uri: process.env.REACT_APP_API_ENDPOINT })

const authMiddleware = new ApolloLink((operation, forward) => {
  const info = store.getState().auth.info

  if (info && isFuture(info.payload.exp * 1000))
    operation.setContext({
      headers: {
        Authorization: `JWT ${info.token}`
      }
    })

  return forward(operation)
})

export const client = new ApolloClient({
  link: authMiddleware.concat(httpLink),
  cache: new InMemoryCache()
})

export function ApolloContext({ children }: PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
