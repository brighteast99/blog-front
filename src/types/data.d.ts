export interface Category {
  id?: number
  name: string
  description?: string
  coverImage?: string
  hasSub: boolean
  subcategoryOf?: Category
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
  content: string
  createdAt: Date
  updatedAt: Date
}
