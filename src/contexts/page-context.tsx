import { useQuery, gql, ApolloError } from '@apollo/client'
import {
  useState,
  useContext,
  createContext,
  SetStateAction,
  Dispatch
} from 'react'
import { ReactNode } from 'react'
import { Bookmark } from '../components/Bookmarks'
import { useUser } from '../contexts/user-context'

interface PageProviderProps {
  children: ReactNode
}

type PageContextProps =
  | {
      perPage: number
      setPerPage: Dispatch<SetStateAction<number>>
      offset: number
      setOffset: Dispatch<SetStateAction<number>>
      count: number | undefined
      search: string
      setSearch: Dispatch<SetStateAction<string>>
      setBookmarkIDs: Dispatch<SetStateAction<string[] | undefined>>
      bookmarks: {
        data:
          | {
              searchBookmarks: Bookmark[]
              getBookmarksCount: number
            }
          | undefined
        loading: boolean | undefined
        error: ApolloError | undefined
      }
    }
  | undefined

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

const PageContext = createContext<PageContextProps>(undefined)

export const usePage = () => {
  const context = useContext(PageContext)

  if (context === undefined) {
    throw new Error('usePage must be used within a PageProvider')
  }

  return context
}

export const PageProvider = ({ children }: PageProviderProps) => {
  const [perPage, setPerPage] = useState(15)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [bookmarkIDs, setBookmarkIDs] = useState<string[] | undefined>()
  const user = useUser()
  const { loading, error, data } = useQuery<{
    searchBookmarks: Bookmark[]
    getBookmarksCount: number
  }>(SEARCH_BOOKMARKS, {
    variables: {
      offset,
      limit: perPage,
      input: {
        id: JSON.stringify(bookmarkIDs),
        authorID: user.data?.createUser.id,
        title: search,
        description: search
      }
    }
  })

  const value: PageContextProps = {
    perPage,
    setPerPage,
    offset,
    setOffset,
    count: data?.getBookmarksCount,
    bookmarks: { data, loading, error },
    search,
    setSearch,
    setBookmarkIDs
  }

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>
}

export { SEARCH_BOOKMARKS }
