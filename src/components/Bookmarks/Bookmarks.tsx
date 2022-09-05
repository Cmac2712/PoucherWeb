import { useQuery, gql } from "@apollo/client"
import { BookmarkPreview } from "./BookmarkPreview"
import { usePage } from '../../contexts/page-context'

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

export const Bookmarks = ({ 
  authorID 
}:Props) => {

    const { perPage, offset, count, setCount } = usePage()

    const { loading, error, data, fetchMore } = useQuery<{
        getBookmarksByAuthor: Bookmark[]
        getBookmarksCount: number
    }>(GET_BOOKMARKS_BY_AUTHOR, {
        onCompleted: ({getBookmarksCount}) => setCount(getBookmarksCount),
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

    return (
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

      </div>
  );
}

export { GET_BOOKMARKS_BY_AUTHOR }