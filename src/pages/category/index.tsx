import { useLayoutEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'

import { useQuery } from '@apollo/client'
import { CATEGORY_INFO } from './api'

import { useAppSelector } from 'app/hooks'
import { selectIsAuthenticated } from 'features/auth/authSlice'

import Icon from '@mdi/react'
import { mdiLock, mdiMagnify, mdiPlus } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { Error } from 'components/Error'
import { PostList } from 'components/postList'
import { SuspendedText } from 'components/SuspendedText'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'

import type { FC, FormEvent } from 'react'
import type { Action } from 'components/Error'
import type { GraphQLFormattedError } from 'graphql'

type PostSearchField = 'titleAndContent' | 'title' | 'content'

export const CategoryPage: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isLoggedIn = useAppSelector(selectIsAuthenticated)

  const { categoryId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageIdx = Number.parseInt(searchParams.get('page') || '') || 0
  const [pageSize, setPageSize] = useState<number>(
    Number.parseInt(searchParams.get('pageSize') || '') || 10
  )
  const [{ searchBy, searchKeyword }, setSearchCondition] = useState<{
    searchBy: PostSearchField
    searchKeyword: string
  }>({
    searchBy: (searchParams.get('key') as PostSearchField) || 'titleAndContent',
    searchKeyword: searchParams.get('value') || ''
  })

  const {
    data: categoryData,
    loading,
    error,
    refetch: refetchCategory
  } = useQuery(CATEGORY_INFO, {
    variables: { id: Number(categoryId) },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    skip:
      isNaN(Number(categoryId)) &&
      categoryId !== undefined &&
      categoryId !== 'all'
  })
  const category = useMemo(() => categoryData?.category, [categoryData])

  const searchPosts = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (
      (searchParams.get('key') ?? 'titleAndContent') === searchBy &&
      (searchParams.get('value') ?? '') === searchKeyword
    )
      return

    searchParams.set('key', searchBy)
    searchParams.set('value', searchKeyword)
    searchParams.delete('page')
    setSearchParams(searchParams)
  }

  useLayoutEffect(() => {
    if (categoryId === undefined) navigate('/category/all', { replace: true })
  }, [categoryId, navigate])

  useLayoutEffect(() => {
    setSearchCondition({
      searchBy:
        (searchParams.get('key') as PostSearchField) || 'titleAndContent',
      searchKeyword: searchParams.get('value') || ''
    })
    setPageSize(Number(searchParams.get('pageSize')) || 10)
  }, [searchParams])

  if (error) {
    if (error.networkError)
      return (
        <Error
          message='게시판 정보를 불러오지 못했습니다'
          actions={[
            {
              label: '다시 시도',
              handler: () => refetchCategory()
            }
          ]}
        />
      )

    if (error.graphQLErrors.length) {
      const errorToShow = error.graphQLErrors[0] as GraphQLFormattedError
      let actions: Action[] = [
        {
          label: '전체 게시글 보기',
          href: { to: '/category/all' }
        }
      ]
      if (errorToShow.extensions?.code === 403)
        actions.unshift({
          label: '로그인',
          href: {
            to: `/login?next=${location.pathname}`,
            option: { replace: true }
          }
        })

      return (
        <Error
          code={(errorToShow.extensions?.code as number) || undefined}
          message={errorToShow.message}
          actions={actions}
        />
      )
    }
  }
  return (
    <>
      {(loading || category?.coverImage) && (
        <div
          className={clsx(
            'h-50 bg-cover bg-center blur-[2px] brightness-50',
            !category?.coverImage && 'animate-pulse !bg-neutral-700'
          )}
          style={{
            backgroundImage: `url(${category?.coverImage})`
          }}
        />
      )}
      <div
        className={clsx(
          'sticky top-0 z-20 px-6 py-2',
          (loading || category?.coverImage) && '-mt-8 mb-8',
          loading && 'animate-pulse'
        )}
      >
        <div className='mb-2'>
          <div className='mb-1 flex items-center'>
            <SuspendedText
              className='text-5xl'
              text={category?.name}
              length={4}
              loading={loading}
            />
            {category?.isHidden && (
              <Icon
                path={mdiLock}
                size={1.2}
                className='ml-1 self-end text-neutral-700'
              />
            )}
          </div>
          <SuspendedText
            className='ml-2 text-lg font-light text-neutral-600'
            text={`${category?.postCount}개 게시물`}
            length={6}
            loading={loading}
          />
        </div>
        <SuspendedText
          className='pl-2 text-lg font-light'
          text={category?.description || `${category?.name}의 모든 게시물`}
          lines={2}
          length={100}
          loading={loading}
        />
      </div>

      <div className='sticky top-0 z-10 -mt-28 h-32 w-full bg-background' />
      <div className='sticky top-32 z-10 mx-auto -mb-0.5 flex w-5/6 items-center gap-2 border-b-2 border-neutral-600 bg-background py-2'>
        {isLoggedIn && (
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton
                className='p-0'
                path={mdiPlus}
                variant='hover-text'
                onClick={() => {
                  let path = '/post/new'
                  const id = Number(categoryId)
                  if (typeof id === 'number' && id > 0)
                    path += `?category=${categoryId}`
                  navigate(path)
                }}
              />
            </TooltipTrigger>
            <TooltipContent>새 글 쓰기</TooltipContent>
          </Tooltip>
        )}

        <div className='grow' />
        <form className='contents' onSubmit={searchPosts}>
          <select
            className='px-4 py-0.5 text-center'
            name='pageSize'
            value={pageSize}
            onChange={(e) => {
              searchParams.set('pageSize', e.target.value)
              setSearchParams(searchParams)
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const size = 5 * (i + 1)
              return (
                <option key={i} value={size}>
                  {size}개씩
                </option>
              )
            })}
          </select>
          <select
            className='w-30 px-2 py-0.5 text-center'
            name='filterBy'
            value={searchBy}
            onChange={(e) =>
              setSearchCondition((prev) => {
                return {
                  ...prev,
                  searchBy: e.target.value as PostSearchField
                }
              })
            }
          >
            <option value='titleAndContent'>제목+내용</option>
            <option value='title'>제목</option>
            <option value='content'>내용</option>
          </select>

          <input
            type='text'
            value={searchKeyword}
            onChange={(e) =>
              setSearchCondition((prev) => {
                return {
                  ...prev,
                  searchKeyword: e.target.value
                }
              })
            }
          />

          <IconButton
            className='ml-1 p-0'
            path={mdiMagnify}
            variant='hover-text'
            type='submit'
          />
        </form>
      </div>
      <div className='mx-auto w-5/6'>
        <PostList
          pageSize={pageSize}
          filterArgs={{
            categoryId: categoryId ? Number(categoryId) : undefined,
            [searchParams.get('key') ?? 'titleAndContent']:
              searchParams.get('value') || ''
          }}
          initialPagination={{
            offset: pageSize * pageIdx
          }}
          useSearchParam='page'
          logHistory
        />
      </div>
    </>
  )
}
