import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Hashtag } from 'types/data'

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
