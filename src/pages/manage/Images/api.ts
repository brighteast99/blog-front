import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { ImageData } from 'types/data'

export const GET_IMAGES: TypedDocumentNode<{ images: ImageData[] }> = gql`
  query Images {
    images {
      id
      url
    }
  }
`

export interface ImageQueryResult {
  image: ImageData
}

export interface ImageQueryVariables {
  url: string
}

export const GET_IMAGE: TypedDocumentNode<
  ImageQueryResult,
  ImageQueryVariables
> = gql`
  query Image($url: String!) {
    image(url: $url) {
      id
      url
      name

      uploadedAt

      thumbnailReferenceCount
      templateThumbnailOf {
        id
        title
      }
      draftThumbnailOf {
        summary
      }
      postThumbnailOf {
        id
        title
      }

      contentReferenceCount
      templateContentOf {
        id
        title
      }
      draftContentOf {
        summary
      }
      postContentOf {
        id
        title
      }
    }
  }
`

export const DELETE_IMAGE: TypedDocumentNode<
  { success: boolean },
  { url: string }
> = gql`
  mutation delteImage($url: String!) {
    deleteImage(url: $url) {
      success
    }
  }
`
