import { useState } from "react"
import { UpdateBookmark } from "../UpdateBookmark"
import { DeleteBookmark } from "../DeleteBookmark"
import { Bookmark } from "./Bookmarks"
import { useAuth0 } from "@auth0/auth0-react";

interface Props extends Bookmark { } 

export const BookmarkPreview = ({
    id,
    url,
    title,
    description,
    screenshotURL
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
            className={`bookmark-preview px-4 py-5 relative w-full max-w-3xl flex flex-wrap md:flex-nowrap`}
        >
            <div className="bookmark-preview-image mr-0 w-28 md:h-28 max-h-28 basis-28 shrink-0 object-cover overflow-hidden text-0 mb-2">
                <img
                    className="rounded"
                    width='100%'
                    height='100%'
                    src={screenshotURL}
                    alt=""
                />
            </div>

            <div className="bookmark-preview-info basis-auto md:pl-4">
                <h2 className="w-full font-bold text-xl mb-3">{title}</h2>
                <p className="w-full mb-3">{description}</p>
                <a
                    className="text-xs text-blue-500"
                    href={url}
                    target="_blank"
                >
                    {url}
                </a>
            </div>

            <div className={`tasks flex items-start ml-auto lg:opacity-0 basis-auto transition-opacity absolute right-0 top-0 md:static ${hover ? 'lg:opacity-100' : '' }`}>
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