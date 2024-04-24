import { ApolloError, TypedDocumentNode, gql } from '@apollo/client'
import { client } from 'ApolloContext'
import { AuthInfo, TokenPayload } from 'types/auth'

export class AuthFailedError extends Error {}
export class RefreshFailedError extends Error {}
export class InvalidTokenError extends Error {}
export class NetworkError extends Error {}

export async function getToken(
  username: string,
  password: string
): Promise<AuthInfo> {
  const GET_TOKEN: TypedDocumentNode<{ tokenAuth: AuthInfo }> = gql`
    mutation getToken($username: String!, $password: String!) {
      tokenAuth(username: $username, password: $password) {
        token
        payload
        refreshExpiresIn
      }
    }
  `

  let data
  try {
    data = await client.mutate({
      mutation: GET_TOKEN,
      variables: {
        username,
        password
      }
    })
  } catch (err) {
    const apolloError = err as ApolloError

    if (apolloError.graphQLErrors.length) throw new AuthFailedError()
    if (apolloError.networkError) throw new NetworkError()

    throw new Error()
  }

  if (!data.data?.tokenAuth) throw new AuthFailedError()

  return data.data?.tokenAuth
}
export async function verifyToken(token?: string): Promise<TokenPayload> {
  const VERIFY_TOKEN: TypedDocumentNode<{
    verifyToken: { payload: TokenPayload }
  }> = gql`
    mutation verifyToken($token: String!) {
      verifyToken(token: $token) {
        payload
      }
    }
  `

  if (!token) throw new InvalidTokenError()

  let data
  try {
    data = await client.mutate({
      mutation: VERIFY_TOKEN,
      variables: {
        token
      }
    })
  } catch (err) {
    const apolloError = err as ApolloError

    if (apolloError.graphQLErrors.length) throw new InvalidTokenError()
    if (apolloError.networkError) throw new NetworkError()

    throw new Error()
  }

  if (!data.data?.verifyToken?.payload) throw new InvalidTokenError()

  return data.data?.verifyToken.payload
}
export async function refreshToken(token: string): Promise<AuthInfo> {
  const REFRESH_TOKEN: TypedDocumentNode<{ refreshToken: AuthInfo }> = gql`
    mutation refreshToken($token: String!) {
      refreshToken(token: $token) {
        token
        payload
        refreshExpiresIn
      }
    }
  `
  let data
  try {
    data = await client.mutate({
      mutation: REFRESH_TOKEN,
      variables: {
        token: token
      }
    })
  } catch (err) {
    const apolloError = err as ApolloError

    if (apolloError.graphQLErrors.length) throw new RefreshFailedError()
    if (apolloError.networkError) throw new NetworkError()

    throw new Error()
  }

  if (!data.data?.refreshToken) throw new RefreshFailedError()

  return data.data?.refreshToken
}

export async function isValidJWT(token: string): Promise<boolean> {
  try {
    verifyToken(token)
  } catch (err) {
    if (err instanceof NetworkError) throw err
    return false
  }

  return true
}

export async function getPayload(token: string): Promise<TokenPayload> {
  await verifyToken(token)

  let base64Payload = token.split('.')[1]
  let payload = atob(base64Payload)
  return JSON.parse(payload)
}

export async function loadAuthInfoFromStorage(): Promise<AuthInfo | null> {
  let token = localStorage.getItem('token')
  if (!token) return null

  let payload
  try {
    payload = await getPayload(token)
  } catch (err) {
    localStorage.removeItem('token')
    return null
  }

  return {
    token,
    payload,
    refreshExpiresIn: payload.origIat + 3600 * 24 * 7
  }
}
