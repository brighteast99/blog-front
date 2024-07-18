import { FC, FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { TypedDocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { BlogInfo as _BlogInfo } from 'types/data'
import { GET_INFO } from 'features/sidebar/Sidebar'
import { mdiClose, mdiRefresh } from '@mdi/js'
import { Avatar } from 'components/Avatar'
import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { NavigationBlocker } from 'components/NavigationBlocker'
import { Spinner } from 'components/Spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from 'components/Tooltip'

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

export const useBlogInfo = (_initialValue: BlogInfo) => {
  const [initialValue, setInitialValue] = useState<BlogInfo>(_initialValue)
  const [value, setValue] = useState<BlogInfo>(_initialValue)
  const [avatarPreview, setAvatarPreview] = useState<string | null>()

  const isModified = JSON.stringify(initialValue) !== JSON.stringify(value)

  const initialize = useCallback(
    (
      value: BlogInfo | ((prev: BlogInfo) => BlogInfo),
      keepInitialValue: boolean = false
    ) => {
      if (!keepInitialValue) setInitialValue(value)
      setValue(value)
    },
    [setInitialValue, setValue]
  )

  function setTitle(title: string) {
    setValue((prev) => {
      return {
        ...prev,
        title
      }
    })
  }

  function setDescription(description: string) {
    setValue((prev) => {
      return {
        ...prev,
        description
      }
    })
  }

  function setAvatar(avatar?: File | null) {
    setValue((prev) => {
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
    if (value.avatar) {
      url = URL.createObjectURL(value.avatar)
      setAvatarPreview(url)
    } else setAvatarPreview(null)

    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [value.avatar])

  return {
    info: value,
    isModified,
    avatarPreview,
    initialize,
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
    isModified,
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
    if (data?.blogInfo)
      initialize(
        {
          title: data.blogInfo.title,
          description: data.blogInfo.description
        },
        false
      )
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
            title: title || data?.blogInfo?.title || '',
            description: description || data?.blogInfo?.description || '',
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
      data?.blogInfo?.description,
      data?.blogInfo?.title,
      description,
      resetUpdateMutation,
      title
    ]
  )

  if (loading) return <Spinner size='lg' />
  return (
    <>
      <NavigationBlocker
        enabled={isModified}
        message={'변경점이 있습니다.\n페이지를 벗어나시겠습니까?'}
      />
      <div className='p-5'>
        <form
          className='mx-auto flex w-120 flex-col gap-3'
          onSubmit={updateInfo}
        >
          <div className='relative mx-auto rounded-full'>
            <div
              className='absolute flex size-full cursor-pointer flex-col items-center justify-center rounded-full bg-background bg-opacity-40 transition-colors [&:not(:hover)]:opacity-0'
              onClick={() => {
                ImageInput.current?.click()
              }}
            >
              <span className='block text-xl text-foreground'>변경</span>
              {(data?.blogInfo?.avatar || avatar) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconButton
                      className='absolute right-0 top-0 !bg-transparent p-1'
                      path={
                        profileChanged && data?.blogInfo?.avatar
                          ? mdiRefresh
                          : mdiClose
                      }
                      variant='text'
                      type='button'
                      color={
                        profileChanged && data?.blogInfo?.avatar
                          ? 'unset'
                          : 'error'
                      }
                      onClick={(e) => {
                        e.stopPropagation()
                        setAvatar(
                          profileChanged && data?.blogInfo?.avatar
                            ? undefined
                            : null
                        )
                        if (ImageInput.current) ImageInput.current.value = ''
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {profileChanged && data?.blogInfo?.avatar
                      ? '되돌리기'
                      : '기본 이미지로 변경'}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <input
              ref={ImageInput}
              type='file'
              className='invisible absolute'
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return setAvatar(null)

                // Maximum file size 1MB
                if (file.size > 1024 * 1024 * 1)
                  return alert(
                    `파일 크기는 1MB를 넘을 수 없습니다.\n선택한 파일 크기: ${Math.round((file.size / 1024 / 1024) * 10) / 10}MB`
                  )

                setAvatar(file)
              }}
            />
            <Avatar
              size='2xl'
              imgSrc={
                avatar === null
                  ? undefined
                  : avatarPreview ?? data?.blogInfo?.avatar
              }
            />
          </div>
          <input
            className='h-8 px-1.5'
            type='text'
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={data?.blogInfo?.title || '블로그 제목'}
          />
          <textarea
            className='min-h-32 p-2'
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={data?.blogInfo?.description || '블로그 소개'}
          />

          <ThemedButton
            className='h-10 w-full py-0.5 text-lg'
            color='primary'
            disabled={
              !title.length ||
              !description.length ||
              (!profileChanged &&
                title === data?.blogInfo?.title &&
                description === data?.blogInfo?.description)
            }
          >
            {updating ? <Spinner size='xs' /> : '저장'}
          </ThemedButton>
        </form>
      </div>
    </>
  )
}
