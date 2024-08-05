import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useMutation, useQuery } from '@apollo/client'
import { GET_INFO, UPDATE_INFO } from './api'

import { mdiClose, mdiRefresh } from '@mdi/js'
import { Avatar } from 'components/Avatar'
import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Error } from 'components/Error'
import { Spinner } from 'components/Spinner'
import { NavigationBlocker } from 'components/utils/NavigationBlocker'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'
import { useBlogInfo } from './hooks'

import type { FC, FormEvent } from 'react'

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

  const {
    data: blogInfoData,
    loading: loadingBlogInfo,
    error: errorLoadingBlogInfo,
    refetch: refetchBlogInfo
  } = useQuery(GET_INFO, { notifyOnNetworkStatusChange: true })
  const blogInfo = useMemo(() => blogInfoData?.blogInfo, [blogInfoData])

  const [_updateInfo, { loading: updating, reset: resetUpdateMutation }] =
    useMutation(UPDATE_INFO)

  const profileChanged = avatar || avatar === null

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
            title: title || blogInfo?.title || '',
            description: description || blogInfo?.description || '',
            avatar
          }
        },
        onCompleted: () => {},
        onError: ({ networkError, graphQLErrors }) => {
          if (networkError)
            if (networkError) alert('정보 수정 중 오류가 발생했습니다.')
            else if (graphQLErrors.length) alert(graphQLErrors[0].message)
          resetUpdateMutation()
        }
      })
    },
    [
      _updateInfo,
      avatar,
      blogInfo?.description,
      blogInfo?.title,
      description,
      resetUpdateMutation,
      title
    ]
  )

  useEffect(() => {
    if (blogInfo)
      initialize(
        {
          title: blogInfo.title,
          description: blogInfo.description
        },
        false
      )
  }, [initialize, blogInfo])

  if (loadingBlogInfo) return <Spinner size='lg' />
  if (errorLoadingBlogInfo)
    return (
      <Error
        code={500}
        hideDefaultAction
        actions={[{ label: '다시 시도', handler: refetchBlogInfo }]}
      />
    )
  return (
    <>
      <NavigationBlocker
        enabled={isModified}
        message={'변경점이 있습니다.\n페이지를 벗어나시겠습니까?'}
      />
      <div className='relative p-5'>
        <form
          className='absolute inset-0 m-auto flex h-fit w-120 flex-col gap-3'
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
              {(blogInfo?.avatar || avatar) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconButton
                      className='absolute right-0 top-0 !bg-transparent p-1'
                      path={
                        profileChanged && blogInfo?.avatar
                          ? mdiRefresh
                          : mdiClose
                      }
                      variant='text'
                      type='button'
                      color={
                        profileChanged && blogInfo?.avatar ? 'unset' : 'error'
                      }
                      onClick={(e) => {
                        e.stopPropagation()
                        setAvatar(
                          profileChanged && blogInfo?.avatar ? undefined : null
                        )
                        if (ImageInput.current) ImageInput.current.value = ''
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {profileChanged && blogInfo?.avatar
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
                  : (avatarPreview ?? blogInfo?.avatar)
              }
            />
          </div>
          <input
            className='h-8 px-1.5'
            type='text'
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={blogInfo?.title || '블로그 제목'}
          />
          <textarea
            className='min-h-32 p-2'
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={blogInfo?.description || '블로그 소개'}
          />

          <ThemedButton
            className='h-10 w-full py-0.5 text-lg'
            color='primary'
            disabled={
              !title.length ||
              !description.length ||
              (!profileChanged &&
                title === blogInfo?.title &&
                description === blogInfo?.description)
            }
          >
            {updating ? <Spinner size='xs' /> : '저장'}
          </ThemedButton>
        </form>
      </div>
    </>
  )
}
