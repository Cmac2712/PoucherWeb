import create from 'zustand'
import { Bookmark } from '../components/Bookmarks'

interface PageState {
  perPage: number
  setPerPage: (perPage: number) => void
  offset: number
  setOffset: (perPage: number) => void
  bookmarks: Bookmark[]
  setBookmarks: (bookmarks: Bookmark[]) => void
  count: number
  setCount: (count: number) => void
  search: string
  setSearch: (search: string) => void
  category: string
  setCategory: (category: string) => void
  bookmarkIDs: string[] | undefined
  setBookmarkIDs: (ids: string[] | undefined) => void
}

const usePageStore = create<PageState>((set) => ({
  perPage: 15,
  setPerPage: (perPage) => set({ perPage }),
  offset: 0,
  setOffset: (offset) => set({ offset }),
  count: 0,
  setCount: (count) => set({ count }),
  bookmarks: [],
  setBookmarks: (bookmarks) => set({ bookmarks }),
  search: '',
  setSearch: (search) => set({ search }),
  bookmarkIDs: undefined,
  setBookmarkIDs: (bookmarkIDs) => set({ bookmarkIDs }),
  category: 'All',
  setCategory: (category) => set({ category })
}))

export { usePageStore }
