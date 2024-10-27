import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { PostInput } from 'api/post'
import type { Draft } from 'types/data'

export const CREATE_DRAFT: TypedDocumentNode<
  { createDraft: { createdDraft: Draft } },
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

export const GET_DRAFT: TypedDocumentNode<{ draft: Draft }, { id: number }> =
  gql`
    query GetDraft($id: Int!) {
      draft(id: $id) {
        id
        summary
        category {
          id
        }
        title
        content
        textContent
        isHidden
        thumbnail
        images
        tags
      }
    }
  `
export const GET_DRAFTS: TypedDocumentNode<{ drafts: Draft[] }> = gql`
  query GetDrafts {
    drafts {
      id
      summary
      updatedAt
    }
  }
`

export const UPDATE_DRAFT: TypedDocumentNode<
  { updateDraft: { success: boolean } },
  { id: number; data: PostInput }
> = gql`
  mutation UpdateDraft($id: Int!, $data: DraftInput!) {
    updateDraft(id: $id, data: $data) {
      success
    }
  }
`

export const DELETE_DRAFT: TypedDocumentNode<
  { deleteDraft: { success: boolean } },
  { id: number }
> = gql`
  mutation DeleteDraft($id: Int!) {
    deleteDraft(id: $id) {
      success
    }
  }
`
