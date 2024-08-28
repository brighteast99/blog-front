import { useCallback, useEffect, useMemo } from 'react'

import { useMutation, useQuery } from '@apollo/client'
import { GET_INFO, UPDATE_INFO } from './api'

import { useAppDispatch } from 'store/hooks'
import { updateBlogInfo } from 'store/slices/blog/blogSlice'

import Icon from '@mdi/react'
import { mdiImage } from '@mdi/js'
import { Avatar } from 'components/Avatar'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Error } from 'components/Error'
import { ImageInput } from 'components/ImageInput'
import { Spinner } from 'components/Spinner'
import { NavigationBlocker } from 'components/utils/NavigationBlocker'
import { useBlogInfoInput } from './hooks'

import type { FC, FormEvent } from 'react'

export const ManageInfoPage: FC = () => {
  const dispatch = useAppDispatch()
  const {
    blogInfoInput: { title, description, avatar, favicon },
    initialize,
    hasChange,
    setTitle,
    setDescription,
    setAvatar,
    setFavicon
  } = useBlogInfoInput({
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

  const updateInfo = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      _updateInfo({
        refetchQueries: [{ query: GET_INFO }],
        variables: {
          data: {
            title: title || blogInfo?.title || '',
            description: description || blogInfo?.description || '',
            avatar,
            favicon
          }
        },
        onCompleted: ({ updateInfo: { updatedInfo } }) =>
          dispatch(updateBlogInfo({ blogInfo: updatedInfo })),
        onError: ({ networkError, graphQLErrors }) => {
          if (networkError) alert('정보 수정 중 오류가 발생했습니다.')
          if (graphQLErrors.length) alert(graphQLErrors[0].message)
          resetUpdateMutation()
        }
      })
    },
    [
      dispatch,
      _updateInfo,
      title,
      description,
      avatar,
      favicon,
      blogInfo?.title,
      blogInfo?.description,
      resetUpdateMutation
    ]
  )

  useEffect(() => {
    if (blogInfo)
      initialize({
        title: blogInfo.title,
        description: blogInfo.description,
        avatar: undefined,
        favicon: undefined
      })
  }, [blogInfo, initialize])

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
        enabled={hasChange}
        message={'변경점이 있습니다.\n페이지를 벗어나시겠습니까?'}
      />
      <div className='relative p-5'>
        <form
          className='absolute inset-0 m-auto flex h-fit w-120 flex-col gap-3'
          onSubmit={updateInfo}
        >
          <ImageInput
            className='mx-auto'
            initialImage={blogInfo?.avatar}
            sizeLimit={3}
            Viewer={<Avatar className='mx-auto border-2' size='2xl' />}
            onInput={(file) => setAvatar(file)}
          />

          <div className='flex gap-2'>
            <ImageInput
              className='bg-tranparent size-8 border-none'
              initialImage={blogInfo?.favicon}
              accept='.ico'
              sizeLimit={1}
              placeholder={<Icon path={mdiImage} />}
              menuPlacement='left-start'
              onInput={(file) => setFavicon(file)}
            />
            <input
              className='h-8 grow px-1.5'
              type='text'
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={blogInfo?.title || '블로그 제목'}
            />
          </div>

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
            disabled={!title.length || !description.length || !hasChange}
          >
            {updating ? <Spinner size='xs' /> : '저장'}
          </ThemedButton>
        </form>
      </div>
    </>
  )
}
