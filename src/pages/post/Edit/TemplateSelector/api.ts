import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Template } from 'types/data'

export const GET_TEMPLATES: TypedDocumentNode<{ templates: Template[] }> = gql`
  query GetTemplates {
    templates {
      id
      templateName
    }
  }
`

export const GET_TEMPLATE: TypedDocumentNode<
  { template: Template },
  { id: number }
> = gql`
  query GetTemplate($id: Int!) {
    template(id: $id) {
      id
      title
      content
      textContent
      thumbnail
      images
      tags
    }
  }
`
