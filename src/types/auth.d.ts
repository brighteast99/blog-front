export interface TokenPayload {
  username: string
  exp: number
  origIat: number
}

export interface AuthInfo {
  token: string
  payload: TokenPayload
  refreshExpiresIn: number
  refreshToken: string
}
