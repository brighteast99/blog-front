import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { BlogInfo } from 'types/data'

export interface BlogInfoInput extends Omit<BlogInfo, 'avatar'> {
  avatar?: File | null
}

export const UPDATE_INFO: TypedDocumentNode<
  { updateInfo: { updatedInfo: BlogInfo } },
  { data: BlogInfoInput }
> = gql`
  mutation UpdateInfo($data: InfoInput!) {
    updateInfo(data: $data) {
      updatedInfo {
        title
        description
        avatar
      }
    }
  }
`
