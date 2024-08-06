import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { BlogInfo } from 'features/blog/blogSlice'

export interface BlogInfoInput extends Omit<BlogInfo, 'avatar' | 'favicon'> {
  avatar?: File | null
  favicon?: File | null
}

export const GET_INFO: TypedDocumentNode<{ blogInfo: BlogInfo }> = gql`
  query BlogInfo {
    blogInfo {
      title
      description
      avatar
      favicon
    }
  }
`

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
        favicon
      }
    }
  }
`
