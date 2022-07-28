import { useState } from "react"
import { useQuery, useMutation, gql } from "@apollo/client"
import { DeleteBookmark } from "../DeleteBookmark"

const GET_BOOKMARKS = gql`
  query GetBookmarks {
    bookmarks {
      id
      title
      url
      videoUrl
    }
  }
`

export interface Bookmark {
    id: number
    title: string
    url: string
    videoUrl: string
}

export const Bookmarks = () => {
    const { loading, error, data } = useQuery<{
        bookmarks: Bookmark[]
    }>(GET_BOOKMARKS)

    const [nothing, setNothing] = useState(false)

    if (loading) return (
      <div className="container mx-auto max-w-3xl mb-4">
        <p>Loading...</p>
      </div>
    )

    if (error) return <p>Error :(</p>;

    return (
        <ul className="container mx-auto max-w-3xl mb-4">
            {data?.bookmarks?.map(({ id, videoUrl }) => {

              if (!videoUrl) return

              return (
                  <li 
                    className="pb-2"
                    key={id}
                  >
                    <video controls width="250">
                        <source src={videoUrl} type="video/mp4"/>
                        Sorry, your browser doesn't support embedded videos.
                    </video>
                    <DeleteBookmark
                      id={id}
                    />
                  </li>
              )
            }

            )}
        </ul>
    );
}

export { GET_BOOKMARKS }