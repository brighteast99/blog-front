import { CategoryListItem } from './CategoryListItem'

import type { FC } from 'react'
import type { Category } from 'types/data'

export const CategoryList: FC<{
  categoryHierarchy: Category[]
}> = ({ categoryHierarchy }) => {
  return (
    <ul>
      {categoryHierarchy.map((category) => (
        <CategoryListItem key={category.id ?? null} category={category} />
      ))}
    </ul>
  )
}
