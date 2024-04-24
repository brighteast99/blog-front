export interface UserInfo {
  username: string
  password: string
}

export interface TokenPayload {
  username: string
  exp: number
  origIat: number
}

export interface AuthInfo {
  token: string
  payload: TokenPayload
  refreshExpiresIn: number
}
