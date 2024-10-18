import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Post } from 'types/data'

export const PostSortConditions = [
  { name: '정확도순', value: 'relavant' },
  { name: '최신순', value: 'recent' }
] as const

export type PostSortCondition = (typeof PostSortConditions)[number]['value']

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
  orderBy?: PostSortCondition
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
    $tag: [String]
    $offset: Int
    $targetPost: ID
    $pageSize: Int
    $orderBy: String
  ) {
    posts(
      categoryId: $categoryId
      titleAndContent: $titleAndContent
      title: $title
      content: $content
      tag: $tag
      offset: $offset
      targetPost: $targetPost
      pageSize: $pageSize
      orderBy: $orderBy
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
        titleHighlights
        textContent
        contentHighlights
        thumbnail
        tags
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
