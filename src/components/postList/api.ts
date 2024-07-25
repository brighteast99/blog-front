import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Pagination, Post } from 'types/data'

export type PostsQueryResult = {
  posts: {
    edges: {
      cursor: string
      node: Post
    }[]
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string
      endCursor: string
    }
  }
}
export interface PostsQueryVariables extends Pagination {
  categoryId?: number | null
  title?: string
  content?: string
}

export const GET_POSTS: TypedDocumentNode<
  PostsQueryResult,
  PostsQueryVariables
> = gql`
  query Posts($categoryId: Decimal) {
    posts(categoryId: $categoryId) {
      edges {
        node {
          category {
            id
            name
            isHidden
            ancestors {
              id
              name
            }
          }
          id
          title
          textContent
          thumbnail
          isHidden
          createdAt
        }
      }
    }
  }
`
