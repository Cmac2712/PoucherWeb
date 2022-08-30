import { useState } from "react"
import { UpdateBookmark } from "../UpdateBookmark"
import { DeleteBookmark } from "../DeleteBookmark"
import { Bookmark } from "./Bookmarks"
import { useAuth0 } from "@auth0/auth0-react";

interface Props extends Bookmark {
} 

export const BookmarkPreview = ({
    id,
    url,
    title,
    description
}:Props) => {

    const [updateMode, setUpdateMode] = useState(false)
    const [hover, setHover] = useState(false)
    const { user, isAuthenticated, isLoading } = useAuth0()

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
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={`bookmark-preview w-full max-w-3xl flex flex-wrap`}
        >
            <h2 className="w-full font-bold text-xl">{title}</h2>
            <p className="w-full">{description}</p>
            <a
                className="text-xs text-blue-500"
                href={url}
                target="_blank"
            >
                {url}
            </a>

            <div className={`tasks flex items-start ml-auto lg:opacity-0 ${hover ? 'lg:opacity-100' : '' } transition-opacity`}>
                <button
                    className="btn btn-sm text-xs font-bold mr-2"
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