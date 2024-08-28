import { createSlice } from '@reduxjs/toolkit'

import type { RootState } from 'store'

export interface BlogInfo {
  title: string
  description: string
  avatar?: string
  favicon?: string
}

const initialState: BlogInfo = {
  title: 'blog',
  description: '',
  avatar: undefined,
  favicon: undefined
}

export const createBlogInfoSlice = (initialState: BlogInfo) =>
  createSlice({
    name: 'blog',
    initialState,
    reducers: {
      updateBlogInfo: (
        state,
        action: {
          payload: { blogInfo: BlogInfo }
          type: string
        }
      ) => {
        let { blogInfo } = action.payload

        return blogInfo
      }
    }
  })

export const blogInfoSlice = createBlogInfoSlice(initialState)

export const { updateBlogInfo } = blogInfoSlice.actions

export const selectBlogInfo = (state: RootState) => state.blog

export default blogInfoSlice.reducer
