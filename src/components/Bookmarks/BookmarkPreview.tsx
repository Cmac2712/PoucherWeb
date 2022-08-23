import { useState } from "react"
import { UpdateBookmark } from "../UpdateBookmark"
import { DeleteBookmark } from "../DeleteBookmark"
import { Bookmark } from "./Bookmarks"

export const BookmarkPreview = ({
    id,
    url,
    title,
    description
}: Bookmark) => {

    const [updateMode, setUpdateMode] = useState(false)

    if (updateMode) return ( 
        <UpdateBookmark
            id={id}
            title={title}
            description={description}
            setMode={setUpdateMode}
        /> 
    )

    return (
     <div className="bookmark-preview flex flex-wrap">
        <h2 className="text-xl w-full">{title}</h2>
        <p className="w-full">{description}</p>
        <a
            className="text-blue-500"
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
            />
        </div>
    </div>
    )

}