import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Category, Hashtag } from 'types/data'

export const CATEGORY_INFO: TypedDocumentNode<
  { category: Category },
  { id?: number }
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

export const SEARCH_HASHTAGS: TypedDocumentNode<
  { hashtags: Hashtag[] },
  { keyword?: string; limit?: number }
> = gql`
  query Hashtags($keyword: String, $limit: Int) {
    hashtags(keyword: $keyword, limit: $limit) {
      name
    }
  }
`
