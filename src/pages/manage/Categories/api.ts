import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Category } from 'types/data'

export type CategoryHierarchyQueryResult = { categoryHierarchy: string }

export interface CategoryInput {
  coverImage?: File | null
  name: string
  description: string
  subcategoryOf?: number
  isHidden: boolean
}

export const CREATE_CATEGORY: TypedDocumentNode<
  { createCategory: { createdCategory: Category } },
  { data: CategoryInput }
> = gql`
  mutation CreateCategory($data: CategoryInput!) {
    createCategory(data: $data) {
      createdCategory {
        id
      }
    }
  }
`

export const GET_CATEGORY_HIERARCHY: TypedDocumentNode<CategoryHierarchyQueryResult> = gql`
  query categoryHierarchy {
    categoryHierarchy
  }
`

export const CATEGORY_FULL_INFO: TypedDocumentNode<
  { category: Category },
  { id: number }
> = gql`
  query Category($id: Int) {
    category(id: $id) {
      id
      name
      isHidden
      description
      coverImage
      subcategoryOf {
        id
      }
    }
  }
`

export const VALID_SUPERCATEGORIES: TypedDocumentNode<
  { validSupercategories: Category[] },
  { id: number }
> = gql`
  query ValidSupercategories($id: Int!) {
    validSupercategories(id: $id) {
      id
      name
      isHidden
    }
  }
`

export const UPDATE_CATEGORY: TypedDocumentNode<
  { updateCategory: { success: boolean } },
  { id: number; data: CategoryInput }
> = gql`
  mutation UpdateCategory($id: Int!, $data: CategoryInput!) {
    updateCategory(id: $id, data: $data) {
      success
    }
  }
`

export const DELETE_CATEGORY: TypedDocumentNode<
  { deleteCategory: { success: boolean } },
  { id: number }
> = gql`
  mutation DeleteCategory($id: Int!) {
    deleteCategory(id: $id) {
      success
    }
  }
`
