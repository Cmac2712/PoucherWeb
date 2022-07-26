import { useState } from "react";
import { useMutation, gql } from "@apollo/client";

import { Bookmark, GET_BOOKMARKS } from '../Bookmarks';

const CREATE_BOOKMARK_MUTATION = gql`
	mutation CREATE_BOOKMARK($bookmark: BookmarkInput) {
        createBookmark(bookmark: $bookmark) {
                title
                url
            }
	}
`;

interface BookmarkInput {
    title: string
    url: string
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
        <form
            onSubmit={async (e) => {
                e.preventDefault()
                createBookmark({
                    variables: {
                        bookmark: formData
                    }
                })
                setFormData({ title: "", url: "" })
            }}
        >
            <input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                type="text"
                name="title"
                placeholder="Bookmark Title"
            />
            <input
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                type="text"
                name="url"
                placeholder="Url"
            />

            <button
                type="submit"
            >
                Add
            </button>
        </form>
    )
}