import { Template } from 'types/data'

import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Hashtag } from 'types/data'

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

export const SEARCH_HASHTAGS: TypedDocumentNode<
  { hashtags: Hashtag[] },
  { keyword?: string; limit?: number }
> = gql`
  query Hashtags($keyword: String, $limit: Int) {
    hashtags(keyword: $keyword, limit: $limit) {
      name
    }
  }
`
