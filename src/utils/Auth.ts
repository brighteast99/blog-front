import { client } from 'ApolloContext'

import { ApolloError, gql } from '@apollo/client'

import { isPast } from 'utils/dayJS'
import { STORAGE_KEY } from 'features/auth/authSlice'

import type { TypedDocumentNode } from '@apollo/client'
import type { AuthInfo, TokenPayload } from 'types/auth'

export class AuthFailedError extends Error {}
export class TokenExpiredError extends Error {}
export class RefreshExpiredError extends Error {}
export class InvalidTokenError extends Error {}
export class NetworkError extends Error {}

export function formatRefreshToken(refreshToken: string, expiresIn: number) {
  return `${refreshToken};${expiresIn}`
}

export function parseRefreshToken(str: string): {
  refreshToken: string
  expiresIn: number
} {
  const [refreshToken, expiresIn] = str.split(';')
  return {
    refreshToken,
    expiresIn: Number(expiresIn)
  }
}

export async function auth(
  username: string,
  password: string
): Promise<AuthInfo> {
  const GET_TOKEN: TypedDocumentNode<{ tokenAuth: AuthInfo }> = gql`
    mutation getToken($username: String!, $password: String!) {
      tokenAuth(username: $username, password: $password) {
        token
        payload
        refreshExpiresIn
        refreshToken
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

  client.resetStore()
  return data.data?.tokenAuth as AuthInfo
}
export async function verify(token?: string): Promise<TokenPayload> {
  const VERIFY_TOKEN: TypedDocumentNode<{
    verifyToken: { payload: TokenPayload }
  }> = gql`
    mutation verify($token: String!) {
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

    if (apolloError.graphQLErrors.length) {
      if (
        apolloError.graphQLErrors.some(
          (error) => error.message === 'Signature has expired'
        )
      )
        throw new TokenExpiredError()

      throw new InvalidTokenError()
    }
    if (apolloError.networkError) throw new NetworkError()

    throw new Error()
  }

  return data.data?.verifyToken.payload as TokenPayload
}
export async function refresh(refreshToken: string): Promise<AuthInfo> {
  const REFRESH_TOKEN: TypedDocumentNode<{ refreshToken: AuthInfo }> = gql`
    mutation refresh($refreshToken: String!) {
      refreshToken(refreshToken: $refreshToken) {
        token
        payload
        refreshExpiresIn
        refreshToken
      }
    }
  `
  let data
  try {
    data = await client.mutate({
      mutation: REFRESH_TOKEN,
      variables: {
        refreshToken
      }
    })
  } catch (err) {
    const apolloError = err as ApolloError

    if (apolloError.graphQLErrors.length) {
      if (
        apolloError.graphQLErrors.some(
          (error) => error.message === 'Refresh token is expired'
        )
      )
        throw new RefreshExpiredError()

      throw new InvalidTokenError()
    }
    if (apolloError.networkError) throw new NetworkError()

    throw new Error()
  }

  return data.data?.refreshToken as AuthInfo
}

export async function revoke(refreshToken: string): Promise<boolean> {
  const REVOKE_TOKEN: TypedDocumentNode<{ refreshToken: AuthInfo }> = gql`
    mutation revoke($refreshToken: String!) {
      revokeToken(refreshToken: $refreshToken) {
        revoked
      }
    }
  `
  try {
    await client.mutate({
      mutation: REVOKE_TOKEN,
      variables: {
        refreshToken
      }
    })
    return true
  } catch (err) {
    const apolloError = err as ApolloError

    if (apolloError.networkError) throw new NetworkError()

    return false
  }
}

export async function authFromStorage(): Promise<AuthInfo | null> {
  let data =
    sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY)
  if (!data) return null

  try {
    const { refreshToken, expiresIn } = parseRefreshToken(data)
    if (isPast(expiresIn * 1000)) return null
    return await refresh(refreshToken)
  } catch (err) {
    if (err instanceof TokenExpiredError || err instanceof InvalidTokenError) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    if (err instanceof NetworkError) throw err

    return null
  }
}
