import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Category, Post } from 'types/data'

export interface PostInput
  extends Omit<
    Post,
    'id' | 'category' | 'isDeleted' | 'createdAt' | 'updatedAt' | 'textContent'
  > {
  category?: number
}

export const GET_POSTABLE_CATEGORIES: TypedDocumentNode<{
  categories: Category[]
}> = gql`
  query PostableCategories {
    categories {
      id
      name
      level
      isHidden
    }
  }
`

export const CREATE_DRAFT: TypedDocumentNode<
  { createDraft: { createdDraft: Post } },
  { data: PostInput }
> = gql`
  mutation CreateDraft($data: DraftInput!) {
    createDraft(data: $data) {
      createdDraft {
        id
      }
    }
  }
`

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

export const DELETE_IMAGE: TypedDocumentNode<
  { deleteImage: { success: boolean } },
  { url: String }
> = gql`
  mutation DeleteImage($url: String!) {
    deleteImage(url: $url) {
      success
    }
  }
`
