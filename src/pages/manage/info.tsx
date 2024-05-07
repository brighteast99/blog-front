import { TypedDocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { mdiClose, mdiRefresh } from '@mdi/js'
import clsx from 'clsx'
import { Avatar } from 'components/Avatar'
import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'
import { GET_INFO } from 'features/sidebar/Sidebar'
import { FC, FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { BlogInfo as _BlogInfo } from 'types/data'

interface BlogInfo extends Omit<_BlogInfo, 'avatar'> {
  avatar?: File | null
}

const UPDATE_INFO: TypedDocumentNode<
  { updateInfo: { updatedInfo: _BlogInfo } },
  { data: BlogInfo }
> = gql`
  mutation UpdateInfo($data: InfoInput!) {
    updateInfo(data: $data) {
      updatedInfo {
        title
        description
        avatar
      }
    }
  }
`

export const useBlogInfo = (initialValue: BlogInfo) => {
  const [info, setInfo] = useState<BlogInfo>(initialValue)
  const [avatarPreview, setAvatarPreview] = useState<string | null>()

  function setTitle(title: string) {
    setInfo((prev) => {
      return {
        ...prev,
        title
      }
    })
  }

  function setDescription(description: string) {
    setInfo((prev) => {
      return {
        ...prev,
        description
      }
    })
  }

  function setAvatar(avatar?: File | null) {
    setInfo((prev) => {
      if (avatar === undefined) {
        return {
          title: prev.title,
          description: prev.description
        }
      }

      return {
        ...prev,
        avatar
      }
    })
  }

  useEffect(() => {
    let url: string
    if (info.avatar) {
      url = URL.createObjectURL(info.avatar)
      setAvatarPreview(url)
    } else setAvatarPreview(null)

    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [info.avatar])

  return {
    info,
    avatarPreview,
    initialize: setInfo,
    setTitle,
    setDescription,
    setAvatar
  }
}

export const ManageInfoPage: FC = () => {
  const ImageInput = useRef<HTMLInputElement>(null)
  const {
    info: { title, description, avatar },
    initialize,
    avatarPreview,
    setTitle,
    setDescription,
    setAvatar
  } = useBlogInfo({
    title: '',
    description: ''
  })
  const { data, loading } = useQuery(GET_INFO)
  const [_updateInfo, { loading: updating, reset: resetUpdateMutation }] =
    useMutation(UPDATE_INFO)

  const profileChanged = avatar || avatar === null

  useEffect(() => {
    if (data)
      initialize({
        title: data.blogInfo.title,
        description: data.blogInfo.description
      })
  }, [data, initialize])

  const updateInfo = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      _updateInfo({
        refetchQueries: [
          {
            query: GET_INFO
          }
        ],
        variables: {
          data: {
            title: title || data?.blogInfo.title || '',
            description: description || data?.blogInfo.description || '',
            avatar
          }
        },
        onCompleted: () => {},
        onError: ({ networkError }) => {
          if (networkError) alert('정보 수정 중 오류가 발생했습니다.')
          resetUpdateMutation()
        }
      })
    },
    [
      _updateInfo,
      avatar,
      data?.blogInfo.description,
      data?.blogInfo.title,
      description,
      resetUpdateMutation,
      title
    ]
  )

  if (loading) return <Spinner size='lg' />
  return (
    <div className='p-5'>
      <form className='mx-auto flex w-120 flex-col gap-3' onSubmit={updateInfo}>
        <div className='relative mx-auto rounded-full'>
          <div
            className='absolute flex size-full cursor-pointer flex-col items-center justify-center rounded-full bg-background bg-opacity-40 transition-colors [&:not(:hover)]:opacity-0'
            onClick={() => {
              ImageInput.current?.click()
            }}
          >
            <span className='block text-xl text-foreground'>변경</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  className={clsx(
                    'absolute right-0 top-0 !bg-transparent p-1',
                    profileChanged ? 'text-foreground' : 'text-error'
                  )}
                  path={profileChanged ? mdiRefresh : mdiClose}
                  variant='text'
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    setAvatar(profileChanged ? undefined : null)
                    if (ImageInput.current) ImageInput.current.value = ''
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                {profileChanged ? '되돌리기' : '기본 이미지로 변경'}
              </TooltipContent>
            </Tooltip>
          </div>
          <input
            ref={ImageInput}
            type='file'
            className='invisible absolute'
            accept='image/*'
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          />
          <Avatar
            size='2xl'
            imgSrc={
              avatar === null
                ? undefined
                : avatarPreview ?? data?.blogInfo.avatar
            }
          />
        </div>
        <input
          className='h-8 px-1.5'
          type='text'
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={data?.blogInfo.title || '블로그 제목'}
        />
        <textarea
          className='min-h-32 p-2'
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={data?.blogInfo.description || '블로그 소개'}
        />

        <ThemedButton
          className='h-10 w-full py-0.5 text-lg text-foreground'
          color='primary'
          disabled={
            !title.length ||
            !description.length ||
            (!profileChanged &&
              title === data?.blogInfo.title &&
              description === data?.blogInfo.description)
          }
        >
          {updating ? <Spinner size='xs' /> : '저장'}
        </ThemedButton>
      </form>
    </div>
  )
}
