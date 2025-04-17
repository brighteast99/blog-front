import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache
} from '@apollo/client'

import { store } from 'store'
import { isFuture } from 'utils/dayJS'

import type { PropsWithChildren } from 'react'

const uploadLink = createUploadLink({
  uri: `${window.location.origin}/api/`
}) as unknown as ApolloLink

const authMiddleware = new ApolloLink((operation, forward) => {
  const info = store.getState().auth.info

  if (info && isFuture(info.payload.exp * 1000))
    operation.setContext({ headers: { Authorization: `JWT ${info.token}` } })

  return forward(operation)
})

export const client = new ApolloClient({
  link: authMiddleware.concat(uploadLink),
  cache: new InMemoryCache(),
  devtools: {
    enabled: !process.env.REACT_APP_PRODUCTION
  }
})

export function ApolloContext({ children }: PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
