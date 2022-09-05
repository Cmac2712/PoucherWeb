import { useState, useContext } from "react"
import { useMutation, gql } from "@apollo/client"
import { GET_BOOKMARKS_BY_AUTHOR } from "../Bookmarks"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { usePage } from "../../contexts/page-context";

const DELETE_BOOKMARK_MUTATION = gql`
  mutation DELETE_BOOKMARK($id: ID!) {
    deleteBookmark(id: $id) {
      id
      title
      url
    }
  }
`

interface Props {
    id?: number,
    authorID?: string
    offset: number
    limit: number
}

export const DeleteBookmark = ({
    id,
    authorID
}: Props ) => {

    const { perPage, offset } = usePage()
    const [deleteBookmark, { loading, error, data }] = useMutation(DELETE_BOOKMARK_MUTATION, {
    refetchQueries: [
      {
        query: GET_BOOKMARKS_BY_AUTHOR,
        variables: {
          id: authorID,
          offset,
          limit: perPage 
        }
      }
    ]
  }
    )

    const [deleted, setDeleted] = useState<String[]>([])

    return (
        <button
            className="btn btn-sm font-bold"
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
            <FontAwesomeIcon icon={faTrashCan}/>
        </button>
    )
}

export { DELETE_BOOKMARK_MUTATION }