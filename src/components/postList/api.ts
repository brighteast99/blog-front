import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Post } from 'types/data'

export type PostsQueryResult = {
  posts: {
    posts: Post[]
    pageInfo: {
      pages: number
      currentPage: number
    }
  }
}
export interface PostsQueryVariables {
  categoryId?: number | null
  titleAndContent?: string
  title?: string
  content?: string
  offset?: number
  targetPost?: string
  pageSize?: number
}

export const GET_POSTS: TypedDocumentNode<
  PostsQueryResult,
  PostsQueryVariables
> = gql`
  query Posts(
    $categoryId: Int
    $titleAndContent: String
    $title: String
    $content: String
    $offset: Int
    $targetPost: ID
    $pageSize: Int
  ) {
    posts(
      categoryId: $categoryId
      titleAndContent: $titleAndContent
      title: $title
      content: $content
      offset: $offset
      targetPost: $targetPost
      pageSize: $pageSize
    ) {
      posts {
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
      pageInfo {
        pages
        currentPage
      }
    }
  }
`
