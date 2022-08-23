import { useState } from "react"
import { useQuery, useMutation, gql } from "@apollo/client"
import { GET_BOOKMARKS } from "../Bookmarks"

const DELETE_BOOKMARK_MUTATION = gql`
  mutation DELETE_BOOKMARK($id: ID!) {
    deleteBookmark(id: $id) {
      id
      title
      url
    }
  }
`

export const DeleteBookmark = (
    { id }: { id: number }
) => {

    const [deleteBookmark, { loading, error, data }] = useMutation(DELETE_BOOKMARK_MUTATION, {
        refetchQueries: () => [
            { query: GET_BOOKMARKS },
            'bookmarks'
        ]
    })

    const [deleted, setDeleted] = useState<String[]>([])

    return (
        <button
            className="text-red-900 font-bold uppercase"
            onClick={async (e) => {
                e.preventDefault()
                setDeleted([...deleted, id])
                deleteBookmark({
                    variables: {
                        id
                    }
                })
            }}
        >
            delete
        </button>
    )
}

export { DELETE_BOOKMARK_MUTATION }