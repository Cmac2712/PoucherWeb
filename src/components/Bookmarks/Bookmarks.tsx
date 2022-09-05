import { useState, createContext } from "react"
import { useQuery, gql } from "@apollo/client"
import { BookmarkPreview } from "./BookmarkPreview"
import { CreateBookmark } from "../CreateBookmark"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'

export interface Bookmark {
    id: number
    title: string
    description: string
    url: string
    videoURL?: string
    screenshotURL?: string
    createdAt?: string
}

const GET_BOOKMARKS_BY_AUTHOR_COUNT = gql`
  query GetBookmarksByAuthorCount($authorId: ID!) {
    getBookmarksByAuthorCount(id: $authorId)
  }
`;

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
}
interface Props {
  authorID: string
}

export const PageContext = createContext({
  perPage: 0,
  offset: 0,
  setOffset: () => {}
})

export const Bookmarks = ({ 
  authorID 
}:Props) => {

    const [perPage, setPerPage] = useState(7)
    const [offset, setOffset] = useState(0)

    const { loading, error, data, fetchMore } = useQuery<{
        getBookmarksByAuthor: Bookmark[]
        getBookmarksCount: number
    }>(GET_BOOKMARKS_BY_AUTHOR, {
        variables: {
          id: authorID,
          offset,
          limit: perPage
        }
    })

    if (loading) return (
      <div className="mb-4">
        <p>Loading...</p>
      </div>
    )

    if (error) return <p>Error :(</p>;

    const count = data?.getBookmarksCount || 0;
    const pages = Math.ceil(count / perPage)
    const currentPage = Math.floor(offset / perPage) + 1

    return (
    <PageContext.Provider
      value={{
        perPage,
        setOffset,
        offset
      }
      }
    >
      <div className="flex flex-wrap items-start h-full">
        <ul className="basis-full">

          {data?.getBookmarksByAuthor?.map(({ id, screenshotURL, url, title, description, createdAt }) => {

            return (
              <li
                className="basis-full border-base-300 border-t first:border-0"
                key={id}
              >
                <BookmarkPreview
                  id={id}
                  url={url}
                  title={title}
                  description={description}
                  createdAt={createdAt}
                  screenshotURL={screenshotURL}
                />

              </li>
            )
          }

          )}
        </ul>

        <div className="fixed bottom-10 right-10">
          <CreateBookmark />
        </div>

        {/* PAGINATION */}
        {
          pages > 1 &&

          <div className="flex basis-full mb-5 max-w-3xl mt-auto">

            <div className="btn-group">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  setOffset(offset - perPage)
                }}
                className="btn btn-md"
              >
                <FontAwesomeIcon icon={faAngleLeft} />
              </button>

              {Array.from(Array(pages), (e, i) => {
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setOffset(i * perPage)
                    }}
                    className={`btn btn-md ${currentPage === i + 1 ? 'btn-active' : ''}`}>
                    {i + 1}
                  </button>
                )
              })}

              <button
                disabled={currentPage === pages}
                onClick={() => {
                  setOffset(offset + perPage)
                }}
                className="btn btn-md"
              >
                <FontAwesomeIcon icon={faAngleRight} />
              </button>
            </div>
          </div>

        }
      </div>

    </PageContext.Provider>
  );
}

export { GET_BOOKMARKS_BY_AUTHOR }