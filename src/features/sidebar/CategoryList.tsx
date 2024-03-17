import { FC, createContext, useContext } from 'react'
import { gql, useSuspenseQuery } from '@apollo/client'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { Category } from 'types/data'

const GET_CATEGORIES = gql`
  query CategoryList {
    categoryList {
      id
      name
      hasSub
      postCount
      subcategories {
        id
        name
        hasSub
        postCount
        subcategories {
          id
          name
          hasSub
          postCount
        }
      }
    }
  }
`

export const CategoryItem: FC<{ category: Category }> = ({ category }) => {
  const { pathname } = useContext(CategoryListContext)
  const isActive = pathname === `/category/${category.id}`

  return (
    <li>
      <Link
        className={clsx(
          'flex justify-between py-0.5 transition-colors',
          isActive && 'pointer-events-none text-primary'
        )}
        to={`/category/${category.id}`}
      >
        <span className={clsx(isActive ? 'font-semibold' : 'font-medium')}>
          {category.name}{' '}
        </span>
        <span className={clsx('font-light opacity-50')}>
          ({category.postCount})
        </span>
      </Link>
      {category.hasSub && (
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
  const { data } = useSuspenseQuery<{ categoryList: Category[] }>(
    GET_CATEGORIES
  )

  const DefaultCategory: Category = {
    id: 0,
    name: '전체 게시물',
    description: '',
    hasSub: false,
    subcategories: [],
    postCount: 0,
    posts: []
  }

  return (
    <CategoryListContext.Provider value={{ pathname }}>
      <ul>
        <CategoryItem category={DefaultCategory} />
        {data.categoryList.map((category) => (
          <CategoryItem key={category.id} category={category} />
        ))}
      </ul>
    </CategoryListContext.Provider>
  )
}
