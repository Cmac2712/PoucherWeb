import { useState } from "react"
import { useQuery, useMutation, gql } from "@apollo/client"
import { BookmarkPreview } from "./BookmarkPreview"

export interface Bookmark {
    id: number
    title: string
    description: string
    url: string
    videoURL?: string
    screenshotURL?: string
    createdAt: string
}

const GET_BOOKMARKS_BY_AUTHOR = gql`
  query GetBookmarksByAuthor($id: ID!) {
    getBookmarksByAuthor(id: $id) {
      id
      title
      description
      url
      videoURL
      screenshotURL
      createdAt
    }
  }
`

interface Props {
  authorID: string
}

export const Bookmarks = ({ 
  authorID 
}:Props) => {

    const { loading, error, data } = useQuery<{
        getBookmarksByAuthor: Bookmark[]
    }>(GET_BOOKMARKS_BY_AUTHOR, {
        variables: {
          id: authorID 
        }
    })

    const [nothing, setNothing] = useState(false)

    if (loading) return (
      <div className="mb-4">
        <p>Loading...</p>
      </div>
    )

    if (error) return <p>Error :(</p>;

    return (
        <ul className="mb-4 px-3 py-6 flex flex-wrap">
            {data?.getBookmarksByAuthor?.map(({ id, screenshotURL, url, title, description }) => {

               return (
                  <li 
                    className="pb-2 mb-3 basis-full flex"
                    key={id}
                  >

                    <img 
                      className="mr-4 rounded"
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
    );
}

export { GET_BOOKMARKS_BY_AUTHOR }