import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { fileSizeUnitLiteral } from 'types/commonProps'
import type { ImageData } from 'types/data'

export const GET_IMAGES: TypedDocumentNode<
  { images: ImageData[] },
  { unit?: fileSizeUnitLiteral }
> = gql`
  query Images($unit: FileSizeUnit) {
    images {
      id
      name
      url
      size(unit: $unit)
      isReferenced
    }
  }
`

export interface ImageQueryResult {
  image: ImageData
}

export interface ImageQueryVariables {
  url: string
  unit?: fileSizeUnitLiteral
}

export const GET_IMAGE: TypedDocumentNode<
  ImageQueryResult,
  ImageQueryVariables
> = gql`
  query Image($url: String!, $unit: FileSizeUnit) {
    image(url: $url) {
      id
      url
      name
      size(unit: $unit)
      width
      height

      uploadedAt

      isReferenced

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
