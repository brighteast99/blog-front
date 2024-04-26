import { PropsWithChildren } from 'react'
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache
} from '@apollo/client'
import { store } from 'app/store'

const httpLink = new HttpLink({ uri: process.env.REACT_APP_API_ENDPOINT })

const authMiddleware = new ApolloLink((operation, forward) => {
  const token = store.getState().auth.token?.token

  operation.setContext({
    headers: {
      Authorization: token ? `JWT ${token}` : ''
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
