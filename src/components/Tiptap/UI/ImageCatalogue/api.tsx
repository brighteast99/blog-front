import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { ImageData } from 'types/data'

export const GET_IMAGES: TypedDocumentNode<{
  images: ImageData[]
}> = gql`
  query Images {
    images {
      url
    }
  }
`
