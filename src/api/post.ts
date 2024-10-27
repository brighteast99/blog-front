import { gql } from '@apollo/client'
import { FRAGMENT_CATEGORY_MINIMAL } from 'api/category'

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

export interface PostInput
  extends Omit<
    Post,
    'id' | 'category' | 'isDeleted' | 'createdAt' | 'updatedAt'
  > {
  category?: number
}

export const CREATE_POST: TypedDocumentNode<
  { createPost: { createdPost: Post } },
  { data: PostInput }
> = gql`
  mutation CreatePost($data: PostInput!) {
    createPost(data: $data) {
      createdPost {
        id
      }
    }
  }
`

const FRAGMENT_POST_CATEGORY = gql`
  fragment PostCategoryFields on CategoryType {
    ...CategoryMinimalFields
    ancestors {
      id
      name
    }
  }
  ${FRAGMENT_CATEGORY_MINIMAL}
`

const FRAGMENT_POST = gql`
  fragment PostFields on PostType {
    id
    title
    textContent
    thumbnail
    tags
    isHidden
    createdAt
  }
`

export const GET_POST: TypedDocumentNode<{ post: Post }, { id?: string }> = gql`
  query PostData($id: ID!) {
    post(id: $id) {
      category {
        ...PostCategoryFields
      }
      ...PostFields
      content
      images
    }
  }
  ${FRAGMENT_POST_CATEGORY}
  ${FRAGMENT_POST}
`

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
          ...PostCategoryFields
        }
        ...PostFields
        titleHighlights
        contentHighlights
      }
      pageInfo {
        pages
        currentPage
      }
    }
  }
  ${FRAGMENT_POST_CATEGORY}
  ${FRAGMENT_POST}
`

export const UPDATE_POST: TypedDocumentNode<
  { updatePost: { success: boolean } },
  { id: string; data: PostInput }
> = gql`
  mutation UpdatePost($id: ID!, $data: PostInput!) {
    updatePost(id: $id, data: $data) {
      success
    }
  }
`

export const DELETE_POST: TypedDocumentNode<
  {
    deletePost: { success: boolean }
  },
  { id: string }
> = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      success
    }
  }
`
