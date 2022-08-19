import axios from 'axios'
import { useEffect, useState } from "react";
import { useMutation, gql } from "@apollo/client";

import { Bookmark, GET_BOOKMARKS } from '../Bookmarks';

const CREATE_BOOKMARK_MUTATION = gql`
	mutation CREATE_BOOKMARK($bookmark: BookmarkInput) {
        createBookmark(bookmark: $bookmark) {
                title
                description
                url
                videoUrl
            }
	}
`;

interface BookmarkInput {
    title: string
    url: string
    description?: string
}

export const getBookmarkInfo = async (url: string) => {
    const endpoint =  import.meta.env.VITE_SERVER_ENDPOINT
    const response = await axios.post(`${endpoint}getBookmarkInfo?url=${encodeURIComponent(url)}`, {
        url: encodeURIComponent(url)
    })

    return response.data.page;
}

export const getScreenshot = async (url:string) => {
        const endpoint =  import.meta.env.VITE_SERVER_ENDPOINT
        const response = await axios.post(`${endpoint}screenshot?url=${encodeURIComponent(url)}`, {
            url: encodeURIComponent(url)
        })
    
        return response.data.thumbnailKey
}

export const getVideo = async (url:string) => {
    const endpoint = import.meta.env.MODE === 'production' ? import.meta.env.VITE_SERVER_ENDPOINT : 'http://localhost:3001/dev/'
    const response = await axios.get(`${endpoint}video?name=${encodeURIComponent(url)}`)

    return response.data.body.download[1].url

}

export const CreateBookmark = () => {

    const [formData, setFormData] = useState<BookmarkInput>({
        title: "",
        url: ""
    })

    const [createBookmark, { data, loading, error }] = useMutation<Bookmark>(CREATE_BOOKMARK_MUTATION, {
        refetchQueries: [
            {
                query: GET_BOOKMARKS
            }
        ]
    });

    return (
        <div className="container mx-auto max-w-3xl">
            <form
                onSubmit={async (e) => {
                    e.preventDefault()

                    const info = await getBookmarkInfo(formData.url)

                    createBookmark({
                        variables: {
                            bookmark: {
                                ...info,
                                url: formData.url
                            } 
                        }
                    })
                    setFormData({ title: "", url: "" })
                }}
            >
                <div className="flex">
                    <input
                        className="border-0 bg-gray-600 mr-2 p-2 h-10 min-w-0 rounded"
                        value={formData.url}
                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                        type="text"
                        name="url"
                        placeholder="https://&hellip;"
                    />

                    <button
                        className="bg-green-500 border-gray-900 hover:bg-green-500 text-white font-bold py-2 px-4 h-10 rounded"
                        type="submit"
                    >
                        Add
                    </button>
                </div>

            </form>
        </div>
    )
}