import { PropsWithChildren } from 'react'
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache
} from '@apollo/client'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import { store } from 'app/store'
import { isFuture } from 'utils/dayJS'

const uploadLink = createUploadLink({
  uri: process.env.REACT_APP_API_ENDPOINT
}) as unknown as ApolloLink

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
  link: authMiddleware.concat(uploadLink),
  cache: new InMemoryCache()
})

export function ApolloContext({ children }: PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
