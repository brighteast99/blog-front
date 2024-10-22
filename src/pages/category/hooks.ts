import { useDiffState } from 'hooks/useDiffState'
import { createSetter } from 'utils/stateSetter'

import type { PostSortCondition } from 'components/postList/api'
import type { PositiveInteger } from 'types/commonTypes'

export const SearchKeys = [
  { name: '제목+내용', value: 'titleAndContent' },
  { name: '제목', value: 'title' },
  { name: '내용', value: 'content' },
  { name: '태그', value: 'tag' }
] as const
export type SearchKey = (typeof SearchKeys)[number]['value']

interface SearchCondition {
  searchBy: SearchKey
  searchKeyword: string
  sortCondition?: PostSortCondition
  pageSize: PositiveInteger
}

export const useSearchCondition = (initialValue: SearchCondition) => {
  const {
    value: searchCondition,
    initialValue: initialSearchCondition,
    hasChange,
    setValue: setSearchCondition,
    initialize
  } = useDiffState<SearchCondition>(initialValue)

  return {
    searchCondition,
    initialSearchCondition,
    hasChange,
    initialize,
    setSearchCondition,
    setSearchBy: createSetter<SearchKey, SearchCondition>(
      setSearchCondition,
      'searchBy'
    ),
    setSearchKeyword: createSetter<string, SearchCondition>(
      setSearchCondition,
      'searchKeyword'
    ),
    setSortCondition: createSetter<
      PostSortCondition | undefined,
      SearchCondition
    >(setSearchCondition, 'sortCondition'),
    setPageSize: createSetter<PositiveInteger, SearchCondition>(
      setSearchCondition,
      'pageSize'
    )
  }
}
