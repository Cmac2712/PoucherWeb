import { useEffect, useState } from "react"
import { useQuery, useMutation, gql } from "@apollo/client"
import { DeleteBookmark } from "../DeleteBookmark"
import { Video } from "../Video"
import axios from "axios"

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
            {data?.bookmarks?.map(({ id, videoUrl, url, title }) => {

              if (videoUrl) return (
                  <li 
                    className="pb-2"
                    key={id}
                  >
                    <a 
                      href={url}
                      target="_blank"
                    >
                      <img 
                        width={500}
                        src={`https://d16sq6175am0h2.cloudfront.net/${videoUrl}`} 
                        alt="" 
                      />
                    </a>

                    <DeleteBookmark
                      id={id}
                    />
                  </li>
              )

              return (
                  <li 
                    className="pb-2"
                    key={id}
                  >

                    <h3 className="text-2xl">{ title }</h3>
                    <a 
                      href={url}
                      target="_blank"
                    >
                      {url}
                    </a>

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