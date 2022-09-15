import axios from 'axios'
import { useState, useContext, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { Bookmark, SEARCH_BOOKMARKS } from '../Bookmarks';
import { UPDATE_BOOKMARK_MUTATION } from '../UpdateBookmark';
import { Loader } from '../Loader/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faClose } from '@fortawesome/free-solid-svg-icons'
import { usePage } from '../../contexts/page-context';
import { v4 as uuidv4 } from 'uuid';
import './CreateBookmark.css'

const CREATE_BOOKMARK_MUTATION = gql`
	mutation CREATE_BOOKMARK($bookmark: BookmarkInput) {
        createBookmark(bookmark: $bookmark) {
                id
                title
                description
                url
                videoURL
            }
	}
`;
const isURL = (str: string) => {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

export const getBookmarkInfo = async (url: string, cb?: () => void) => {
    const endpoint = import.meta.env.VITE_SERVER_ENDPOINT
    const response = await axios.post(`${endpoint}getBookmarkInfo?url=${encodeURIComponent(url)}`, {
        url: encodeURIComponent(url)
    })

    if (typeof cb !== 'undefined') cb()

    return response.data.page;
}

export const getScreenshot = async (url: string) => {

    try {
        const endpoint = import.meta.env.VITE_SERVER_ENDPOINT
        const response = await axios.post(`${endpoint}screenshot?url=${encodeURIComponent(url)}`, {
            url: encodeURIComponent(url)
        })

        return response.data.thumbnailKey as string | null;
    } catch (e) {
        console.error(e)
        return false
    }
}

export const getVideo = async (url: string) => {
    const endpoint = import.meta.env.MODE === 'production' ? import.meta.env.VITE_SERVER_ENDPOINT : 'http://localhost:3001/dev/'
    const response = await axios.get(`${endpoint}video?name=${encodeURIComponent(url)}`)

    return response.data.body.download[1].url
}

export const CreateBookmark = () => {

    const { offset, perPage, search } = usePage()
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [formData, setFormData] = useState<Pick<Bookmark, 'title' | 'url'>>({
        title: "",
        url: ""
    })
    const [open, setOpen] = useState(false)
    const [loadingInfo, setLoadingInfo] = useState(false)
    const [createBookmark, { data, loading, error }] = useMutation<{
        createBookmark: Bookmark
    }>(CREATE_BOOKMARK_MUTATION
        , {
            refetchQueries: [
                {
                    query: SEARCH_BOOKMARKS,
                    variables: {
                        offset,
                        limit: perPage,
                        input: {
                            authorID: user?.sub,
                            title: search,
                            description: search,
                            tags: search
                        }
                    }
                }
            ]
        }
    )
    const [updateBookmarkWithScreenshot, updateBookmarkWithScreenshotResponse] = useMutation(UPDATE_BOOKMARK_MUTATION, {
        refetchQueries: [
            {
                query: SEARCH_BOOKMARKS,
                variables: {
                    offset,
                    limit: perPage,
                    input: {
                        authorID: user?.sub,
                        title: search,
                        description: search
                    }
                }
            }
        ]
    }
    )

    return (
        <>
            <div className={`flex relative bottom-20 m-auto h-12 z-10 ${open ? 'slide-in' : 'slide-out'}`}>
                    <button
                        className='btn btn-square rounded-r-none'
                        onClick={
                            e => {
                                e.preventDefault()
                                setOpen(false)
                            }
                        }
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </button>
                <form
                    className='flex'
                    onSubmit={async (e) => {
                        e.preventDefault()

                        setFormData({ title: "", url: "" })
                        setLoadingInfo(true);

                        const id = uuidv4()
                        const info = await getBookmarkInfo(formData.url, () => {
                            setLoadingInfo(false)
                            setOpen(false)
                        })

                        createBookmark(({
                            variables: {
                                bookmark: {
                                    id,
                                    title: info.title,
                                    description: info.description,
                                    authorID: user?.sub,
                                    url: formData.url,
                                    screenshotURL: info.image,
                                }
                            }
                        }))

                    }}
                >
                    <input
                        disabled={loading || loadingInfo}
                        type="text"
                        value={formData.url}
                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                        name="url"
                        placeholder="https://&hellip;"
                        className="input input-bordered input-primary w-full max-w-xs rounded-none"
                    />

                    <button
                        className="btn btn-square w-28 flex-grow-0 flex-auto px-4 rounded-l-none"
                        type="submit"
                    >
                        {
                            loading || loadingInfo ?
                                <Loader /> : 'Add'

                        }
                    </button>

                </form>
            </div>

            <button
                className="btn btn-square px-4 absolute top-0 bottom-0 m-auto right-4 h-12"
                onClick={() => {
                    setOpen(!open)
                    const url = navigator.clipboard.readText().then(clip => {

                        if (!isURL(clip)) return

                        setFormData({
                            ...formData,
                            url: clip
                        })
                    })
                }

                }
            >
                <FontAwesomeIcon icon={faPlus} />
            </button>

        </>
    )
}