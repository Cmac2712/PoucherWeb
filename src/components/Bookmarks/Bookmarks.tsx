import { useQuery, gql } from "@apollo/client"
import { BookmarkPreview } from "./BookmarkPreview"
import { usePage } from '../../contexts/page-context'
import { Loader } from "../Loader/Loader"

export interface Bookmark {
    id: number
    title: string
    description: string
    url: string
    videoURL?: string
    authorID?: string
    screenshotURL?: string
    createdAt?: string
    tags?: string[] 
}

const GET_BOOKMARKS_COUNT = gql`
  query GetBookmarksCount($input: BookmarkInput) {
    getBookmarksCount(input: $input)
  }
`

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

const GET_BOOKMARKS_BY_AUTHOR = gql`
  query GetBookmarksByAuthor(
      $id: ID!
      $offset: Int
      $limit: Int
    ) {
    getBookmarksByAuthor(
        id: $id
        offset: $offset
        limit: $limit
      ) {
          id
          title
          description
          url
          videoURL
          screenshotURL
          createdAt
    }
    getBookmarksCount(id: $id)
  }
`

export interface PaginationProps {
    perPage: number
    offset: number
    search: string
}

interface Props {
  authorID: string
}

export const Bookmarks = ({ 
  authorID 
}:Props) => {

    const { perPage, offset, count, setCount, search, setSearch } = usePage()

    const { loading, error, data, fetchMore } = useQuery<{
        searchBookmarks: Bookmark[]
        getBookmarksCount: number
    }>(SEARCH_BOOKMARKS, {
        onCompleted: ({getBookmarksCount}) => setCount(getBookmarksCount),
        variables: {
          offset,
          limit: perPage,
          input: {
            authorID,
            title: search,
            description: search,
            tags: search
          }
        }
    })

    if (loading) return <Loader />

    if (error) return <p>{JSON.stringify(error)}</p>;

    return (
      <div className="flex flex-wrap items-start">

        { search &&
          <div className="flex search-text p-4">
           <p>search: </p> { search }
            <p className="mr-2">
              Search results for <em>{search}</em>
            </p>
            <button 
              onClick={() => setSearch('') }
              className="text-blue-500 underline">
                clear search
            </button>
          </div>
        }

        <ul className="basis-full">

          {data?.searchBookmarks?.map((data) => {

            const tagsParsed = JSON.parse(data.tags)

            return (
              <li
                className="basis-full border-base-300 border-t first:border-0"
                key={data.id}
              >
                <BookmarkPreview
                  data={{
                    ...data,
                    tags: tagsParsed 
                  }}
                />

              </li>
            )
          }

          )}
        </ul>

      </div>
  );
}

export { SEARCH_BOOKMARKS }