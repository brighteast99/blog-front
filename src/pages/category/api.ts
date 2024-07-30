import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Category } from 'types/data'

export const CATEGORY_INFO: TypedDocumentNode<
  { category: Category },
  { id: number }
> = gql`
  query Category($id: Int) {
    category(id: $id) {
      id
      name
      isHidden
      description
      postCount
      coverImage
    }
  }
`
