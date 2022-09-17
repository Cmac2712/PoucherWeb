import { useQuery, gql } from "@apollo/client"
import { useState, useContext, createContext, SetStateAction, Dispatch} from "react"
import { ReactNode } from 'react'
import { Bookmark } from '../components/Bookmarks'
import { useUser } from '../contexts/user-context'

interface PageProviderProps {
  children: ReactNode
}

type PageContextProps = {
    perPage: number
    setPerPage: Dispatch<SetStateAction<number>> 
    offset: number
    setOffset: Dispatch<SetStateAction<number>> 
    count: number | undefined
    search: string
    setSearch: Dispatch<SetStateAction<string>> 
    bookmarks: {
      data: {
        searchBookmarks: Bookmark[]
      } 
      loading: boolean
      error: boolean
    } 
} | undefined

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
      tags
    }
    getBookmarksCount(input: $input)
}
`

const PageContext = createContext<PageContextProps>(undefined)

export const usePage = () => {
  const context = useContext(PageContext)

  if (context === undefined) {
    throw new Error('usePage must be used within a PageProvider')
  }

  return context
}

export const PageProvider = ({ children }: PageProviderProps) => {
  const [perPage, setPerPage] = useState(7)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState("")
  const user = useUser()
  const { loading, error, data } = useQuery<{
      searchBookmarks: Bookmark[]
      getBookmarksCount: number
  }>(SEARCH_BOOKMARKS, {
      variables: {
        offset,
        limit: perPage,
        input: {
          authorID: user.data?.createUser.id,
          title: search,
          description: search,
          tags: search
        }
      }
  })

  const value = { 
    perPage, 
    setPerPage, 
    offset, 
    setOffset, 
    count: data?.getBookmarksCount, 
    bookmarks: { data, loading, error },
    search, 
    setSearch 
  }

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>
}

export { SEARCH_BOOKMARKS }
