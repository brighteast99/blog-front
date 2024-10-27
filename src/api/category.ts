import { gql } from '@apollo/client'

import type { TypedDocumentNode } from '@apollo/client'
import type { Category } from 'types/data'

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

export const FRAGMENT_CATEGORY_MINIMAL = gql`
  fragment CategoryMinimalFields on CategoryType {
    id
    name
    isHidden
  }
`

const FRAGMENT_CATEGORY_DETAILED = gql`
  fragment CategoryDetailedFields on CategoryType {
    ...CategoryMinimalFields
    description
    coverImage
  }
  ${FRAGMENT_CATEGORY_MINIMAL}
`

export const CATEGORY_INFO: TypedDocumentNode<
  { category: Category },
  { id?: number }
> = gql`
  query Category($id: Int) {
    category(id: $id) {
      ...CategoryDetailedFields
      postCount
    }
  }
  ${FRAGMENT_CATEGORY_DETAILED}
`

export const CATEGORY_FULL_INFO: TypedDocumentNode<
  { category: Category },
  { id: number }
> = gql`
  query Category($id: Int) {
    category(id: $id) {
      ...CategoryDetailedFields
      subcategoryOf {
        id
      }
    }
  }
  ${FRAGMENT_CATEGORY_DETAILED}
`
export type CategoryHierarchyQueryResult = { categoryHierarchy: string }

export const GET_CATEGORY_HIERARCHY: TypedDocumentNode<CategoryHierarchyQueryResult> = gql`
  query categoryHierarchy {
    categoryHierarchy
  }
`

export const VALID_SUPERCATEGORIES: TypedDocumentNode<
  { validSupercategories: Category[] },
  { id: number }
> = gql`
  query ValidSupercategories($id: Int!) {
    validSupercategories(id: $id) {
      ...CategoryMinimalFields
    }
  }
  ${FRAGMENT_CATEGORY_MINIMAL}
`

export const GET_POSTABLE_CATEGORIES: TypedDocumentNode<{
  categories: Category[]
}> = gql`
  query PostableCategories {
    categories {
      ...CategoryMinimalFields
      level
    }
  }
  ${FRAGMENT_CATEGORY_MINIMAL}
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
  { id: number; deletePosts?: boolean }
> = gql`
  mutation DeleteCategory($id: Int!, $deletePosts: Boolean) {
    deleteCategory(id: $id, deletePosts: $deletePosts) {
      success
    }
  }
`
