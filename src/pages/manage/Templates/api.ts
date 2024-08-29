import { Template } from 'types/data'

import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'

export interface TemplateInput extends Omit<Template, 'id'> {}

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
export const GET_TEMPLATES: TypedDocumentNode<{ templates: Template[] }> = gql`
  query GetTemplates {
    templates {
      id
      title
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
