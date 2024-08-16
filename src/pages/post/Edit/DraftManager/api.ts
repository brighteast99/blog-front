import { Draft } from 'types/data'

import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'

export const GET_DRAFTS: TypedDocumentNode<{ drafts: Draft[] }> = gql`
  query GetDrafts {
    drafts {
      id
      summary
      createdAt
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
