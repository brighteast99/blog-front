import {
  ChangeEvent,
  FC,
  FormEvent,
  useCallback,
  useEffect,
  useState
} from 'react'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'
import { UserInfo } from 'types/auth'
import { useDispatch } from 'react-redux'
import { selectIsAuthenticated, setToken } from 'features/auth/authSlice'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthFailedError, NetworkError, getToken } from 'utils/Auth'
import { useAppSelector } from 'app/hooks'

export const useUserInfo = (initialValue: UserInfo) => {
  const [info, setInfo] = useState<UserInfo>(initialValue)

  function updateInfo(e: ChangeEvent<HTMLInputElement>) {
    setInfo((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value
      }
    })
  }

  return { info, updateInfo }
}

export const LoginPage: FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loggedIn = useAppSelector(selectIsAuthenticated)
  const { next } = useParams()
  const { info, updateInfo } = useUserInfo({
    username: '',
    password: ''
  })
  const [keepLogin, setKeepLogin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (loggedIn) navigate(next ?? '/', { replace: true })
  }, [navigate, loggedIn, next])

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      setLoading(true)
      getToken(info.username, info.password)
        .then((token) => {
          if (keepLogin) localStorage.setItem('token', token.token)
          dispatch(setToken(token))
          navigate(next ?? '/', { replace: true })
        })
        .catch((err) => {
          if (err instanceof NetworkError) return alert('오류가 발생했습니다.')
          if (err instanceof AuthFailedError)
            return alert('계정 정보가 올바르지 않습니다')
        })
        .finally(() => setLoading(false))
    },
    [dispatch, info, keepLogin, navigate, next]
  )

  return (
    <div className='flex size-full flex-col items-center justify-center gap-5'>
      <p className='text-center text-3xl'>관리자 로그인</p>
      <form onSubmit={onSubmit}>
        <input
          className='mb-3 block h-8 w-60 px-1.5'
          type='text'
          autoFocus
          required
          name='username'
          placeholder='ID'
          value={info.username}
          onChange={updateInfo}
        />
        <input
          className='mb-3 block h-8 w-60 px-1.5'
          type='password'
          required
          name='password'
          placeholder='PW'
          value={info.password}
          onChange={updateInfo}
        />
        <label className='mb-3 block'>
          <input
            className='mr-1 accent-primary'
            type='checkbox'
            checked={keepLogin}
            onChange={(e) => setKeepLogin(e.target.checked)}
          />
          7일간 로그인 유지
        </label>
        <ThemedButton
          className='h-11 w-full px-2 py-1 text-lg font-semibold text-foreground'
          type='submit'
          color='primary'
          variant='flat'
          disabled={loading}
        >
          {loading ? <Spinner size='xs' /> : '로그인'}
        </ThemedButton>
      </form>
    </div>
  )
}
