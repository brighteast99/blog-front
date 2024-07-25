import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Post } from 'types/data'

export const GET_POST: TypedDocumentNode<{ post: Post }, { id?: string }> = gql`
  query PostData($id: ID!) {
    post(id: $id) {
      id
      title
      category {
        id
        name
        isHidden
        ancestors {
          id
          name
        }
      }
      isHidden
      thumbnail
      images
      createdAt
      content
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
