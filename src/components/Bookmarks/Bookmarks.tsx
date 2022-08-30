import { useState } from "react"
import { useQuery, useMutation, gql } from "@apollo/client"
import { BookmarkPreview } from "./BookmarkPreview"
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
    createdAt: string
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

interface Props {
  authorID: string
}

export const Bookmarks = ({ 
  authorID 
}:Props) => {

    const [perPage, setPerPage] = useState(10)
    const [offset, setOffset] = useState(0)

    const { loading, error, data, fetchMore } = useQuery<{
        getBookmarksByAuthor: Bookmark[]
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
      <div className="flex flex-wrap items-start h-full">
        <ul className="px-3">
            {data?.getBookmarksByAuthor?.map(({ id, screenshotURL, url, title, description }) => {

               return (
                  <li 
                    className="basis-full mb-7 flex items-start"
                    key={id}
                  >

                    <img 
                      className="mt-1 mr-4 rounded"
                      width={100}
                      src={`https://d16sq6175am0h2.cloudfront.net/${screenshotURL}`} 
                      alt="" 
                    />

                    <BookmarkPreview
                      id={id}
                      url={url}
                      title={title}
                      description={description}
                    />

                  </li>
              )
            }

            )}
        </ul>

{/* PAGINATION */}
{
  pages > 1 &&

        <div className="flex justify-center basis-full">
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
  );
}

export { GET_BOOKMARKS_BY_AUTHOR }