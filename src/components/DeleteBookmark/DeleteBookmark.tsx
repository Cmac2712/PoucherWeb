import { useState, useContext } from "react"
import { useMutation, gql } from "@apollo/client"
import { SEARCH_BOOKMARKS } from "../Bookmarks"
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
}

export const DeleteBookmark = ({
    id,
    authorID
}: Props ) => {

    const { perPage, offset, search } = usePage()
    const [deleteBookmark, { loading, error, data }] = useMutation(DELETE_BOOKMARK_MUTATION, {
    refetchQueries: [
      {
        query: SEARCH_BOOKMARKS,
        variables: {
          id: authorID,
          offset,
          limit: perPage,
          input: {
            authorID,
            title: search,
            description: search
          }
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