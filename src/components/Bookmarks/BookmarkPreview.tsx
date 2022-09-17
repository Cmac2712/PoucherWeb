import { useState } from "react"
import { UpdateBookmark } from "../UpdateBookmark"
import { DeleteBookmark } from "../DeleteBookmark"
import { Bookmark } from "./Bookmarks"
import { Loader } from "../Loader/Loader"
import { useAuth0 } from "@auth0/auth0-react"
import { useModal } from '../../contexts/modal-context'
import './Bookmarks.css'

type Props = {
    data: Bookmark
}  

export const BookmarkPreview = ({
    data: {
        id,
        url,
        title,
        description,
        screenshotURL,
        tags
    }
}:Props) => {

    const [updateMode, setUpdateMode] = useState(false)
    const [hover, setHover] = useState(false)
    const { user, isLoading } = useAuth0()
    const { openModal, modalOpen, setModalContent } = useModal()

    if (isLoading) return <Loader /> 


    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={`bookmark-preview px-4 py-5 lg:py-3 relative w-full max-w-3xl flex flex-wrap md:flex-nowrap`}
        >

            { screenshotURL &&
                <div className="bookmark-preview-image mr-0 w-24 md:h-24 max-h-24 basis-24 shrink-0 object-cover overflow-hidden text-0 mb-2">
                    <img
                        className="rounded"
                        width='100%'
                        height='100%'
                        src={screenshotURL}
                        alt=""
                    />
                </div>
            }

            <div className="bookmark-preview-info basis-full md:pl-4">
                <h2 className="w-full font-bold text-lg mb-3 lg:mb-0">{title}</h2>
                <p className="text-base w-full mb-3 bookmark-preview-description">{description}</p>
                <a
                    className="inline-block text-xs text-blue-500 mb-2"
                    href={url}
                    target="_blank"
                >
                    {url}
                </a>

                { tags && typeof tags !== 'string' && 
                    <div className="flex">
                     { tags.list?.map((tag, i) => <div key={i} className="underline text-blue-500 gap-2 mr-2"> { tag ? tag?.split(':')[1] : ''} </div>) }
                    </div>
                }

            </div>

            <div className={`tasks flex items-start ml-auto lg:opacity-0 basis-auto transition-opacity absolute right-4 top-4 md:static ${hover ? 'lg:opacity-100' : '' }`}>
                        <button
                            className="btn btn-sm text-xs font-bold mr-2"
                            onClick={() => {
                                setModalContent(
                                    <UpdateBookmark
                                        id={id}
                                        title={title}
                                        description={description}
                                        setMode={setUpdateMode}
                                        screenshotURL={screenshotURL}
                                        tags={tags}
                                    />)
                                openModal()
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