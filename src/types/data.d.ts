export interface Category {
  id?: number
  name: string
  description: string
  isHidden: boolean
  coverImage?: string
  subcategoryOf?: Category
  ancestors?: Category[]
  subcategories: Category[]
  level: number
  posts: Post[]
  postCount: number
}

export interface Template {
  id: number
  title: string
  content: string
  textContent: srting
  images: string[]
  thumbnail?: string
}

export interface Draft extends Template {
  category: Category
  summary: string
  isHidden: boolean
  createdAt: Date
}

export interface Post extends Omit<Draft, 'id' | 'summary'> {
  id: string
  titleHighlights?: number[][]
  contentHighlights?: number[][]
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface ImageData {
  id: number
  url: string
  name: string
  size: number
  width: number
  height: number
  uploadedAt: Date
  isReferenced: boolean
  templateThumbnailOf: Template[]
  templateContentOf: Template[]
  draftThumbnailOf: Draft[]
  draftContentOf: Draft[]
  postThumbnailOf: Post[]
  postContentOf: Post[]
  thumbnailReferenceCount: number
  contentReferenceCount: number
}
