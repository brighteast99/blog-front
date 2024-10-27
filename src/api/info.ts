import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { BlogInfo } from 'store/slices/blog/blogSlice'

export interface BlogInfoInput extends Omit<BlogInfo, 'avatar' | 'favicon'> {
  avatar?: File | null
  favicon?: File | null
}

const FRAGMENT_INFO = gql`
  fragment InfoFields on InfoType {
    title
    description
    avatar
    favicon
  }
`

export const GET_INFO: TypedDocumentNode<{ blogInfo: BlogInfo }> = gql`
  query BlogInfo {
    blogInfo {
      ...InfoFields
    }
  }
  ${FRAGMENT_INFO}
`

export const UPDATE_INFO: TypedDocumentNode<
  { updateInfo: { updatedInfo: BlogInfo } },
  { data: BlogInfoInput }
> = gql`
  mutation UpdateInfo($data: InfoInput!) {
    updateInfo(data: $data) {
      updatedInfo {
        ...InfoFields
      }
    }
  }
  ${FRAGMENT_INFO}
`
