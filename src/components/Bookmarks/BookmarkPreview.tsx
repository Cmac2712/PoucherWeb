import { useState } from "react"
import { UpdateBookmark } from "../UpdateBookmark"
import { DeleteBookmark } from "../DeleteBookmark"
import { Bookmark } from "./Bookmarks"
import { useAuth0 } from "@auth0/auth0-react";

export const BookmarkPreview = ({
    id,
    url,
    title,
    description
}: Bookmark) => {

    const [updateMode, setUpdateMode] = useState(false)
    const { user, isAuthenticated, isLoading } = useAuth0();

    if (isLoading) return <p>Loading...</p>

    if (updateMode) return ( 
        <UpdateBookmark
            id={id}
            title={title}
            description={description}
            setMode={setUpdateMode}
            authorID={user?.sub}
        /> 
    )

    return (
     <div className="bookmark-preview max-w-3xl flex flex-wrap">
        <h2 className="w-full font-bold text-xl">{title}</h2>
        <p className="w-full">{description}</p>
        <a
            className="text-xs text-blue-500"
            href={url}
            target="_blank"
        >
            { url }
        </a>

        <div className="tasks ml-auto">
            <button
                className="text-green-900 font-bold uppercase mr-2"
                onClick={() => {
                    setUpdateMode(true)
                }}
            >edit</button>

            <DeleteBookmark
                id={id}
                authorID={user?.sub}
            />
        </div>
    </div>
    )

}