import { useState } from "react"
import { useQuery, useMutation, gql } from "@apollo/client"
import { BookmarkPreview } from "./BookmarkPreview"

import { Video } from "../Video"

export interface Bookmark {
    id: number
    title: string
    description: string
    url: string
    videoURL?: string
    screenshotURL?: string
    createdAt: string
}

const GET_BOOKMARKS = gql`
  query GetBookmarks {
    bookmarks {
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

export const Bookmarks = () => {
    const { loading, error, data } = useQuery<{
        bookmarks: Bookmark[]
    }>(GET_BOOKMARKS)

    const [nothing, setNothing] = useState(false)

    if (loading) return (
      <div className="mb-4">
        <p>Loading...</p>
      </div>
    )

    if (error) return <p>Error :(</p>;

    return (
        <ul className="mb-4 px-3 py-6 flex flex-wrap">
            {data?.bookmarks?.map(({ id, screenshotURL, url, title, description }) => {

               return (
                  <li 
                    className="pb-2 mb-3 basis-full flex"
                    key={id}
                  >

                    <img 
                      className="mr-4"
                      width={150}
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

export { GET_BOOKMARKS }