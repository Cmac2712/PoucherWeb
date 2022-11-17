import create from 'zustand'

interface PageState {
  perPage: number
  setPerPage: (perPage: number) => void
  offset: number
  setOffset: (perPage: number) => void
  count: number
  search: string
  setSearch: (search: string) => void
  category: string
  setCategory: (category: string) => void
  bookmarkIDs: string[]
  setBookmarkIDs: (ids: string[]) => void
}

const usePageStore = create<PageState>((set) => ({
  perPage: 15,
  setPerPage: (perPage) => set({ perPage }),
  offset: 0,
  setOffset: (offset) => set({ offset }),
  count: 0,
  bookmarks: {},
  search: '',
  setSearch: (search) => set({ search }),
  bookmarkIDs: [],
  setBookmarkIDs: (bookmarkIDs) => set({ bookmarkIDs }),
  category: 'All',
  setCategory: (category) => set({ category })
}))

export { usePageStore }
