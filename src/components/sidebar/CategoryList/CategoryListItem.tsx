import clsx from 'clsx'
import { Link } from 'react-router-dom'

import Icon from '@mdi/react'
import { mdiLock } from '@mdi/js'

import type { FC } from 'react'
import type { Category } from 'types/data'

export const CategoryListItem: FC<{ category: Category }> = ({ category }) => {
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
            <CategoryListItem key={subcategory.id} category={subcategory} />
          ))}
        </ul>
      )}
    </li>
  )
}
