import { useMemo } from 'react'

import { useReadQuery } from '@apollo/client'
import { CategoryHierarchyQueryResult } from 'pages/manage/Categories/api'

import { CategoryListItem } from './CategoryListItem'

import type { FC } from 'react'
import type { QueryRef } from '@apollo/client'
import type { Category } from 'types/data'

export const CategoryList: FC<{
  queryRef: QueryRef<CategoryHierarchyQueryResult>
}> = ({ queryRef }) => {
  const { data } = useReadQuery(queryRef)
  const categoryHierarchy = useMemo(
    () => JSON.parse(JSON.parse(data.categoryHierarchy)) as Category[],
    [data]
  )

  return (
    <ul>
      {categoryHierarchy.map((category) => (
        <CategoryListItem key={category.id ?? null} category={category} />
      ))}
    </ul>
  )
}
