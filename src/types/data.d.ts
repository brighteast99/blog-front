export interface Category {
  id?: number
  name: string
  description: string
  isHidden: boolean
  coverImage?: string
  subcategoryOf?: Category
  ancestors?: Category[]
  subcategories: Category[]
  posts: Post[]
  postCount: number
}

export interface Post {
  id: number
  title: string
  category: Category
  isHidden: boolean
  thumbnail?: string
  images: string[]
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface BlogInfo {
  title: string
  description: string
  avatar?: string
}
