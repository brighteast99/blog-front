import { FC } from 'react'
import { QueryReference, useReadQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { Category } from 'types/data'
import { CategoryListQueryResult } from './Sidebar'
import Icon from '@mdi/react'
import { mdiLock } from '@mdi/js'

export const CategoryItem: FC<{ category: Category }> = ({ category }) => {
  const hasId = category.id !== undefined

  return (
    <li>
      <Link
        className={clsx(
          'flex justify-between py-0.5',
          hasId ? 'font-light' : 'font-medium'
        )}
        to={`/category/${category.id ?? 'all'}`}
      >
        <p>
          {category.name}
          {category.isHidden && (
            <Icon
              className='ml-0.5 inline text-neutral-700'
              path={mdiLock}
              size={0.45}
            />
          )}
        </p>
        <span className={clsx(hasId && 'text-neutral-500')}>
          ({category.postCount})
        </span>
      </Link>
      {category.subcategories.length > 0 && (
        <ul className='ml-4'>
          {category.subcategories.map((subcategory) => (
            <CategoryItem key={subcategory.id} category={subcategory} />
          ))}
        </ul>
      )}
    </li>
  )
}

export const CategoryList: FC<{
  queryRef: QueryReference<CategoryListQueryResult>
}> = ({ queryRef }) => {
  const { data } = useReadQuery(queryRef)

  return (
    <ul>
      {(JSON.parse(JSON.parse(data.categoryList)) as Category[]).map(
        (category) => (
          <CategoryItem key={category.id ?? null} category={category} />
        )
      )}
    </ul>
  )
}
