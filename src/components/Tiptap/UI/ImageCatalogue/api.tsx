import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'

export const GET_IMAGES: TypedDocumentNode<{
  images: string[]
}> = gql`
  query Images {
    images
  }
`
