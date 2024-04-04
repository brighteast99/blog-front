import { FC, createContext } from 'react'
import { gql, useSuspenseQuery } from '@apollo/client'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { Category } from 'types/data'

const GET_CATEGORIES = gql`
  query CategoryList {
    categoryList
  }
`

export const CategoryItem: FC<{ category: Category }> = ({ category }) => {
  const hasId = category.id !== undefined

  return (
    <li>
      <Link
        className={clsx(
          'flex justify-between py-0.5',
          hasId ? 'font-light' : 'font-medium'
        )}
        to={`/category/${category.id ?? ''}`}
      >
        {category.name}
        <span className={clsx(hasId && 'text-neutral-700')}>
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

const CategoryListContext = createContext({ pathname: '/' })

export const CategoryList: FC = () => {
  let { pathname } = useLocation()
  const { data } = useSuspenseQuery<{ categoryList: string }>(GET_CATEGORIES)

  return (
    <CategoryListContext.Provider value={{ pathname }}>
      <ul>
        {(JSON.parse(JSON.parse(data?.categoryList)) as Category[]).map(
          (category) => (
            <CategoryItem key={category.id ?? null} category={category} />
          )
        )}
      </ul>
    </CategoryListContext.Provider>
  )
}
