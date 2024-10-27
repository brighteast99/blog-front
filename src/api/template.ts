import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Template } from 'types/data'
import type { PostInput } from './post'

export interface TemplateInput extends Omit<PostInput, 'isHidden'> {
  templateName: string
}

export const CREATE_TEMPLATE: TypedDocumentNode<
  { createTemplate: { createdTemplate: Template } },
  { data: TemplateInput }
> = gql`
  mutation CreateTemplate($data: TemplateInput!) {
    createTemplate(data: $data) {
      createdTemplate {
        id
      }
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
      templateName
      title
      content
      textContent
      thumbnail
      images
      tags
    }
  }
`

export const GET_TEMPLATES: TypedDocumentNode<{ templates: Template[] }> = gql`
  query GetTemplates {
    templates {
      id
      templateName
    }
  }
`

export const UPDATE_TEMPLATE: TypedDocumentNode<
  { updateTemplate: { success: boolean } },
  { id: number; data: TemplateInput }
> = gql`
  mutation UpdateTemplate($id: Int!, $data: TemplateInput!) {
    updateTemplate(id: $id, data: $data) {
      success
    }
  }
`

export const DELETE_TEMPLATE: TypedDocumentNode<
  { updateTemplate: { success: boolean } },
  { id: number }
> = gql`
  mutation DeleteTemplate($id: Int!) {
    deleteTemplate(id: $id) {
      success
    }
  }
`
