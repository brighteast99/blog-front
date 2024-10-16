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
  templateName: string
  title: string
  content: string
  textContent: srting
  images: string[]
  thumbnail?: string
}

export interface Draft extends Omit<Template, 'templateName'> {
  category: Category
  summary: string
  isHidden: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Post extends Omit<Draft, 'id' | 'summary'> {
  id: string
  isDeleted: boolean
  createdAt: Date
  deletedAt?: Date
}

export type HighlightInterval = [number, number]

export interface PostSearchResult extends Post {
  titleHighlights?: HighlightInterval[]
  contentHighlights?: HighlightInterval[]
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
