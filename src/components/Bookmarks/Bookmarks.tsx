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
}

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

    const { perPage, offset, count, search, setSearch, bookmarks: { data, loading, error} } = usePage()

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
