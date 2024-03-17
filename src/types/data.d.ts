export interface Category {
  id: number,
  name: string,
  description: string,
  hasSub: boolean,
  subcategoryOf?: Category,
  subcategories: Category[],
  posts: Post[],
  postCount: number
}

export interface Post {
  id: number,
  title: string,
  category: Category,
  isHidden: boolean,
  content: string,
  createdAt: Date,
  updatedAt: Date
}