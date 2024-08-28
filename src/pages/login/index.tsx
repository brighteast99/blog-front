import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from 'app/hooks'
import { useToggle } from 'hooks/useToggle'
import { auth, AuthFailedError, NetworkError } from 'utils/Auth'
import { selectIsAuthenticated, setToken } from 'features/auth/authSlice'

import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'

import type { ChangeEvent, FC, FormEvent } from 'react'

export interface UserInfo {
  username: string
  password: string
}

export const LoginPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const loggedIn = useAppSelector(selectIsAuthenticated)
  const [searchParams] = useSearchParams()
  const [{ username, password }, setInput] = useState<UserInfo>({
    username: '',
    password: ''
  })
  const { value: keepLogin, toggle: toggleKeepLogin } = useToggle(true)
  const { value: loading, setValue: setLoading } = useToggle(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (loggedIn) navigate(searchParams.get('next') ?? '/', { replace: true })
  }, [navigate, loggedIn, searchParams])

  const updateInfo = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      setInput((prev) => ({
        ...prev,
        [e.target.name]: e.target.value
      })),
    []
  )

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(undefined)
      auth(username, password)
        .then((authInfo) => {
          dispatch(setToken({ authInfo, keepLogin }))
          navigate(searchParams.get('next') ?? '/', { replace: true })
        })
        .catch((err) => {
          if (err instanceof NetworkError)
            return setError('오류가 발생했습니다.')
          if (err instanceof AuthFailedError)
            return setError('계정 정보가 올바르지 않습니다')
        })
        .finally(() => setLoading(false))
    },
    [
      dispatch,
      keepLogin,
      navigate,
      password,
      searchParams,
      setLoading,
      username
    ]
  )

  return (
    <div className='flex h-lvh min-h-fit w-full flex-col items-center justify-center gap-5'>
      <p className='text-center text-3xl'>관리자 로그인</p>
      <form onSubmit={onSubmit}>
        <input
          className='mb-3 block h-8 w-60 px-1.5'
          type='text'
          autoFocus
          required
          name='username'
          placeholder='ID'
          value={username}
          onChange={updateInfo}
        />
        <input
          className='mb-3 block h-8 w-60 px-1.5'
          type='password'
          required
          name='password'
          placeholder='PW'
          value={password}
          onChange={updateInfo}
        />
        <ThemedButton
          className='mb-3 h-11 w-full px-2 py-1 text-lg font-semibold'
          type='submit'
          color='primary'
          variant='flat'
          disabled={loading}
        >
          {loading ? <Spinner size='xs' /> : '로그인'}
        </ThemedButton>
        <label className='block'>
          <input
            className='mr-1 accent-primary'
            type='checkbox'
            checked={keepLogin}
            onChange={toggleKeepLogin}
          />
          로그인 유지
        </label>
        {error && (
          <p className='mt-2 text-center font-light text-error'>{error}</p>
        )}
      </form>
    </div>
  )
}
