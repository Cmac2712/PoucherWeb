import axios from 'axios'
import { useState, useContext } from "react";
import { useMutation, gql } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";
import { Bookmark, GET_BOOKMARKS_BY_AUTHOR } from '../Bookmarks';
import { UPDATE_BOOKMARK_MUTATION } from '../UpdateBookmark';
import { Loader } from '../Loader/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { usePage } from '../../contexts/page-context';
import { v4 as uuidv4 } from 'uuid';

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

export const getBookmarkInfo = async (url: string, cb?: () => void) => {
    const endpoint = import.meta.env.VITE_SERVER_ENDPOINT
    //const endpoint = 'http://localhost:3001/dev/'
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

    const { offset, perPage } = usePage()
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [formData, setFormData] = useState<Pick<Bookmark, 'title' | 'url'>>({
        title: "",
        url: ""
    })
    const [loadingInfo, setLoadingInfo] = useState(false)

    const [createBookmark, { data, loading, error }] = useMutation<{
        createBookmark: Bookmark
    }>(CREATE_BOOKMARK_MUTATION
        , {
            refetchQueries: [
                {
                    query: GET_BOOKMARKS_BY_AUTHOR,
                    variables: {
                        id: user?.sub,
                        offset,
                        limit: perPage
                    }
                }
            ]
        }
    );

    const [updateBookmarkWithScreenshot, updateBookmarkWithScreenshotResponse] = useMutation(UPDATE_BOOKMARK_MUTATION, {
            refetchQueries: [
                {
                    query: GET_BOOKMARKS_BY_AUTHOR,
                    variables: {
                        id: user?.sub,
                        offset,
                        limit: perPage
                    }
                }
            ]
        }
    );

    return (
        <div className="container mx-auto ">
            <form
                onSubmit={async (e) => {
                    e.preventDefault()

                    setFormData({ title: "", url: "" })
                    setLoadingInfo(true);

                    const id = uuidv4()
                    const info = await getBookmarkInfo(formData.url, () => setLoadingInfo(false))

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

                <div className="flex">
                    <input
                        disabled={loading || loadingInfo}
                        type="text"
                        value={formData.url}
                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                        name="url"
                        placeholder="https://&hellip;"
                        className="input input-bordered input-primary w-full max-w-xs mr-2"
                    />

                    <button
                        className="btn btn-square w-28 flex-grow-0 flex-auto px-4"
                        type="submit"
                    >
                        {
                            loading || loadingInfo ? 
                                <Loader
                                /> :
                                <FontAwesomeIcon icon={faPlus} />
                        }
                    </button>
                </div>

            </form>
        </div>
    )
}