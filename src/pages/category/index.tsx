import { FC } from 'react'
import { useParams } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import { Category } from 'types/data'

const GET_CATEGORY_INFO = gql`
  query CategoryInfo($id: Int) {
    categoryInfo(id: $id) {
      id
      name
      description
      postCount
    }
  }
`
export const CategoryPage: FC = () => {
  const { categoryId } = useParams()
  const { data } = useQuery<{ categoryInfo: Category }>(GET_CATEGORY_INFO, {
    variables: { id: Number(categoryId) }
  })

  if (categoryId === null) return null
  return <div className='size-full'>{JSON.stringify(data?.categoryInfo)}</div>
}
