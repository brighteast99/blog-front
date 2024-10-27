import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { fileSizeUnitLiteral } from 'types/commonProps'
import type { ImageData } from 'types/data'

export const UPLOAD_IMAGE: TypedDocumentNode<
  { uploadImage: { url: string } },
  { file: File }
> = gql`
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file) {
      url
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

export const GET_IMAGES: TypedDocumentNode<{
  images: ImageData[]
}> = gql`
  query Images {
    images {
      url
    }
  }
`

export const GET_IMAGES_WITH_REFERENCE_CHECK: TypedDocumentNode<
  { images: ImageData[] },
  { unit?: fileSizeUnitLiteral }
> = gql`
  query Images {
    images {
      url
      isReferenced
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

export const DELETE_IMAGES: TypedDocumentNode<
  { success: boolean },
  { urls: string[] }
> = gql`
  mutation delteImage($urls: [String]!) {
    deleteImages(urls: $urls) {
      success
    }
  }
`
