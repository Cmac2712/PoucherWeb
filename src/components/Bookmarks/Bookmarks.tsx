import { useQuery, gql } from "@apollo/client"
import { BookmarkPreview } from "./BookmarkPreview"
import { usePage } from '../../contexts/page-context'
import { Loader } from "../Loader/Loader"
import { useEffect } from "react"

export type TagsObj = { list: string[] } | string
  
export interface Bookmark {
    id: number
    title: string
    description: string
    url: string
    videoURL?: string
    authorID?: string
    screenshotURL?: string
    createdAt?: string
    tags: TagsObj 
}

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

    const { perPage, offset, setCount, search, setSearch } = usePage()

    const { loading, error, data } = useQuery<{
        searchBookmarks: Bookmark[]
        getBookmarksCount: number
    }>(SEARCH_BOOKMARKS, {
        //onCompleted: ({getBookmarksCount}) => setCount(getBookmarksCount),
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

    //if (data?.getBookmarksCount) {
        const count = data?.getBookmarksCount ? data?.getBookmarksCount : 0 
        console.log('cound: ', count);
        setCount(count)
    //} 

    if (loading) return <Loader />

    if (error) return <p>{JSON.stringify(error)}</p>;

    return (
      <div className="flex flex-wrap items-start">

        { search &&
          <div className="flex search-text p-4">
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

            const tagsParsed = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags

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