import { useState } from 'react'
import { usePageStore } from '../../store/page-store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { gql } from '@apollo/client'

const SEARCH_BOOKMARKS = gql`
  query SearchBookmarks($offset: Int, $limit: Int, $input: BookmarkInput) {
    searchBookmarks(offset: $offset, limit: $limit, input: $input) {
      id
      authorID
      title
      description
      url
      videoURL
      screenshotURL
      createdAt
    }
    getBookmarksCount(input: $input)
  }
`

export const Search = () => {
  const setSearch = usePageStore((state) => state.setSearch)
  const setOffset = usePageStore((state) => state.setOffset)

  const [searchTerm, setSearchTerm] = useState('')

  return (
    <>
      <div className={`flex h-12 relative z-10`}>
        <form
          className="flex"
          onSubmit={(e) => {
            e.preventDefault()
            setSearchTerm('')
            setOffset(0)
          }}
        >
          <input
            className="input w-full max-w-xs rounded-r-none"
            type="text"
            name="search"
            autoComplete="off"
            placeholder="Search&hellip;"
            onChange={(e) => {
              setSearch(e.target.value)
              setSearchTerm(e.target.value)
            }}
            value={searchTerm}
          />

          <button className="btn rounded-l-none">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </form>
      </div>
      <button className="btn btn-square px-4 absolute top-0 bottom-0 m-auto right-4 h-12">
        <FontAwesomeIcon icon={faSearch} />
      </button>
    </>
  )
}

export { SEARCH_BOOKMARKS }
