import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'

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
