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

interface Template {
  id: number
  title: string
  content: string
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
  textContent: string
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface BlogInfo {
  title: string
  description: string
  avatar?: string
}
