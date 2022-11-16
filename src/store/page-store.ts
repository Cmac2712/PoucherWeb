import create from 'zustand'
import { client } from '../main'
import { gql } from '@apollo/client'

const SEARCH_BOOKMARKS = gql`
  query SearchBookmarks($offset: Int, $limit: Int, $input: BookmarkInput) {
    searchBookmarks(offset: $offset, limit: $limit, input: $input) {
      id
      authorID
      title
      description
      url
      videoURL
      screenshotURL
      createdAt
    }
    getBookmarksCount(input: $input)
  }
`

/**
 * GET THIS TO WORK
 */
console.log(
  '------> ',
  await client.query({
    query: SEARCH_BOOKMARKS,
    variables: { offset: 0, limit: 10, input: { title: 'test' } }
  })
)

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
}

const usePageStore = create<PageState>((set) => ({
  perPage: 15,
  setPerPage: (perPage) => set({ perPage }),
  offset: 0,
  setOffset: (offset) => set({ offset }),
  count: 0,
  //bookmarks: {},
  // count: data?.getBookmarksCount,
  // bookmarks: { data, loading, error },
  search: '',
  setSearch: (search) => set({ search }),
  //setBookmarkIDs: (bookmarkIDs) => set({ bookmarkIDs }),
  category: 'All',
  setCategory: (category) => set({ category })
}))

export { usePageStore }
