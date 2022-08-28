import axios from 'axios'
import { useEffect, useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react";

import { Bookmark, GET_BOOKMARKS_BY_AUTHOR } from '../Bookmarks';
import { UPDATE_BOOKMARK_MUTATION } from '../UpdateBookmark';
import { UpdateBookmark } from '../UpdateBookmark';

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

export interface BookmarkInput {
    title: string
    url: string
    screenshotURL?: string | null 
    description?: string
}

export const getBookmarkInfo = async (url: string) => {
    const endpoint = import.meta.env.VITE_SERVER_ENDPOINT
    const response = await axios.post(`${endpoint}getBookmarkInfo?url=${encodeURIComponent(url)}`, {
        url: encodeURIComponent(url)
    })

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

    const { user, isAuthenticated, isLoading } = useAuth0();
    const [formData, setFormData] = useState<BookmarkInput>({
        title: "",
        url: ""
    })

    const [createBookmark, { data, loading, error }] = useMutation<Bookmark>(CREATE_BOOKMARK_MUTATION
        , {
        refetchQueries: [
            {
                query: GET_BOOKMARKS_BY_AUTHOR,
                variables: {
                    id: user?.sub
                }
            }
        ]
    }
    );

    const [updateBookmarkWithScreenshot, updateBookmarkWithScreenshotResponse] = useMutation(UPDATE_BOOKMARK_MUTATION
        , {
        refetchQueries: [
        {
            query: GET_BOOKMARKS_BY_AUTHOR,
            variables: {
                id: user?.sub
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

                    const info = await getBookmarkInfo(formData.url)

                    const createdBookmark = await createBookmark({
                        variables: {
                            bookmark: {
                                ...info,
                                authorID: user?.sub,
                                url: formData.url
                            }
                        }
                    })

                    // //Update bookmark with screenshot
                    updateBookmarkWithScreenshot({
                        variables: {
                            id: createdBookmark?.data?.createBookmark?.id,
                            updates: {
                                screenshotURL: await getScreenshot(formData.url)
                            }
                        }
                    })

                    setFormData({ title: "", url: "" })
                }}
            >

                <div className="flex">
                    <input 
                        type="text" 
                        value={formData.url}
                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                        name="url"
                        placeholder="https://&hellip;"
                        className="input input-bordered input-primary w-full " 
                    />

                    <button
                        className="btn btn-square flex-grow-1 flex-auto w-auto px-4"
                        type="submit"
                    >
                        Add
                    </button>
                </div>

            </form>
        </div>
    )
}