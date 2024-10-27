import { useLayoutEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'
import { debounce } from 'throttle-debounce'

import { useLazyQuery, useQuery } from '@apollo/client'
import { CATEGORY_INFO } from 'api/category'
import { SEARCH_HASHTAGS } from 'api/hashtag'
import { PostSortConditions } from 'api/post'

import { useAppSelector } from 'store/hooks'
import { selectIsAuthenticatedAndActive } from 'store/slices/auth/authSlice'

import Icon from '@mdi/react'
import { mdiLock, mdiMagnify, mdiPlus } from '@mdi/js'
import { SearchKeys, useSearchCondition } from 'pages/category/hooks'
import { IconButton } from 'components/Buttons/IconButton'
import { Combobox } from 'components/Combobox'
import { Error } from 'components/Error'
import { PostList } from 'components/postList'
import { SuspendedText } from 'components/SuspendedText'

import type { FC, FormEvent } from 'react'
import type { PostSortCondition } from 'api/post'
import type { Action } from 'components/Error'
import type { GraphQLFormattedError } from 'graphql'
import type { SearchKey } from 'pages/category/hooks'
import type { Hashtag } from 'types/data'

const CategoryPage: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isLoggedIn = useAppSelector(selectIsAuthenticatedAndActive)

  const { categoryId: _categoryId } = useParams()
  const categoryId =
    _categoryId === 'all' || _categoryId === undefined
      ? undefined
      : isNaN(Number(_categoryId))
        ? -1
        : Number(_categoryId)
  const [searchParams, setSearchParams] = useSearchParams()
  const pageIdx = Number.parseInt(searchParams.get('page') || '') || 0
  const {
    initialSearchCondition: {
      searchBy,
      searchKeyword,
      sortCondition,
      pageSize
    },
    searchCondition: {
      searchBy: _searchBy,
      searchKeyword: _searchKeyword,
      sortCondition: _sortCondition
    },
    initialize: initializeSearchCondition,
    setSearchBy,
    setSearchKeyword,
    hasChange
  } = useSearchCondition({
    searchBy: (searchParams.get('key') as SearchKey) || 'titleAndContent',
    searchKeyword: searchParams.get('value') || '',
    sortCondition: searchParams.get('value')
      ? (searchParams.get('sort') as PostSortCondition) || 'relavant'
      : undefined,
    pageSize: Math.max(
      1,
      Number.parseInt(searchParams.get('pageSize') || '') || 10
    )
  })

  const {
    data: categoryData,
    loading,
    error,
    refetch: refetchCategory
  } = useQuery(CATEGORY_INFO, {
    variables: { id: categoryId },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true
  })
  const category = useMemo(() => categoryData?.category, [categoryData])

  const [loadHashtags, { loading: loadingHashtags, data: _hashtagData }] =
    useLazyQuery(SEARCH_HASHTAGS, { fetchPolicy: 'cache-and-network' })
  const [hashtagData, setHashtagData] = useState<Hashtag[]>([])
  const hashtags = useMemo(
    () => hashtagData.map((hashtag) => hashtag.name) ?? [],
    [hashtagData]
  )

  const searchHashtags = useMemo(
    () =>
      debounce(250, (keyword: string) => {
        loadHashtags({
          variables: {
            keyword,
            limit: 5
          }
        }).then(({ data }) => setHashtagData(data?.hashtags ?? []))
      }),
    [loadHashtags, setHashtagData]
  )

  const searchPosts = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!hasChange) return

    searchParams.delete('page')
    searchParams.set('key', _searchBy)
    searchParams.set('value', _searchKeyword)
    if (_searchKeyword) searchParams.set('sort', _sortCondition || 'relavant')
    else searchParams.delete('sort')
    setSearchParams(searchParams)
  }

  useLayoutEffect(() => {
    if (_categoryId === undefined) navigate('/category/all', { replace: true })
  }, [_categoryId, navigate])

  useLayoutEffect(() => {
    const searchBy = (searchParams.get('key') as SearchKey) || 'titleAndContent'
    const searchKeyword = searchParams.get('value') ?? ''
    initializeSearchCondition({
      searchBy,
      searchKeyword,
      sortCondition: searchKeyword
        ? (searchParams.get('sort') as PostSortCondition) || 'relavant'
        : undefined,
      pageSize: Math.max(
        1,
        Number.parseInt(searchParams.get('pageSize') || '') || 10
      )
    })
    if (searchBy === 'tag') searchHashtags('')
  }, [initializeSearchCondition, searchParams, searchHashtags])

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
    <div className='relative h-fit'>
      <div
        className={clsx(
          'h-72 bg-neutral-300 bg-cover bg-center blur-[2px] brightness-50',
          loading && 'animate-pulse'
        )}
        style={{
          backgroundImage: `url(${category?.coverImage})`
        }}
      />
      <div
        className={clsx(
          'sticky top-0 z-20 -mt-8 mb-8 px-6 py-2',
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
                className='ml-1 mt-5 align-baseline text-neutral-700'
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
          <IconButton
            className='p-0'
            path={mdiPlus}
            variant='hover-text'
            tooltip='새 글 쓰기'
            onClick={() => {
              let path = '/post/new'
              const id = Number(categoryId)
              if (typeof id === 'number' && id > 0)
                path += `?category=${categoryId}`
              navigate(path)
            }}
          />
        )}

        <div className='grow' />

        <form className='contents' onSubmit={searchPosts}>
          {searchKeyword && (
            <select
              className='w-30 px-2 py-0.5 text-center'
              name='filterBy'
              value={sortCondition}
              onChange={(e) => {
                searchParams.set('sort', e.target.value)
                setSearchParams(searchParams)
              }}
            >
              {PostSortConditions.map(({ name, value }) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          )}
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
            value={_searchBy}
            onChange={(e) => {
              setSearchBy(e.target.value as SearchKey)
              if (_searchBy === 'tag' || e.target.value === 'tag') {
                searchHashtags('')
                setSearchKeyword('')
              }
            }}
          >
            {SearchKeys.map(({ name, value }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>

          {_searchBy === 'tag' ? (
            <Combobox
              className='max-h-16 min-w-44 max-w-120'
              name='태그'
              value={_searchKeyword ? _searchKeyword.split('|') : []}
              placeholder='태그'
              items={hashtags}
              loading={loadingHashtags}
              onChange={(value) => setSearchKeyword(value.join('|'))}
              onInputChange={searchHashtags}
            />
          ) : (
            <input
              type='text'
              value={_searchKeyword}
              placeholder='검색어'
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          )}

          <IconButton
            className='ml-1 p-0'
            path={mdiMagnify}
            variant='hover-text'
            type='submit'
          />
        </form>
      </div>

      <div className='mx-auto w-5/6 bg-background'>
        <PostList
          pageSize={pageSize}
          searchArgs={{
            categoryId,
            [searchBy]:
              searchBy === 'tag' ? searchKeyword.split('|') : searchKeyword
          }}
          initialPagination={{
            offset: pageSize * pageIdx
          }}
          sortCondition={sortCondition}
          useSearchParam='page'
          logHistory
        />
      </div>
    </div>
  )
}

export default CategoryPage
