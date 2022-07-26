import { useState } from "react"
import { useQuery, useMutation, gql } from "@apollo/client"
import { DeleteBookmark } from "../DeleteBookmark"

const GET_BOOKMARKS = gql`
  query GetBookmarks {
    bookmarks {
      id
      title
      url
    }
  }
`

export interface Bookmark {
    id: number
    title: string
    url: string
}

export const Bookmarks = () => {
    const { loading, error, data } = useQuery<{
        bookmarks: Bookmark[]
    }>(GET_BOOKMARKS)

    const [nothing, setNothing] = useState(false)

    if (loading) return <p>Loading...</p>;

    if (error) return <p>Error :(</p>;

    return (
        <ul>
            {data?.bookmarks?.map(bookmark => (
                <li key={bookmark.id}>
                  {bookmark.title} - {bookmark.url}
                  <DeleteBookmark
                    id={bookmark.id}
                  />
                </li>
            ))}
            <li>
              <button
                onClick={() => {setNothing(true)}}
              >
                reload
              </button>
            </li>
        </ul>
    );
}

export { GET_BOOKMARKS }