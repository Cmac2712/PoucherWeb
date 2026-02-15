import create from 'zustand'
import { Bookmark } from '../components/Bookmarks'
import type { Note } from '../api/types'

interface PageState {
  perPage: number
  setPerPage: (perPage: number) => void
  offset: number
  setOffset: (perPage: number) => void
  bookmarks: Bookmark[]
  setBookmarks: (bookmarks: Bookmark[]) => void
  notes: Note[]
  setNotes: (notes: Note[]) => void
  notesCount: number
  setNotesCount: (count: number) => void
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
  notes: [],
  setNotes: (notes) => set({ notes }),
  notesCount: 0,
  setNotesCount: (notesCount) => set({ notesCount }),
  search: '',
  setSearch: (search) => set({ search }),
  bookmarkIDs: undefined,
  setBookmarkIDs: (bookmarkIDs) => set({ bookmarkIDs }),
  category: 'All',
  setCategory: (category) => set({ category })
}))

export { usePageStore }
