import { useState } from 'react'
import { usePage } from '../../contexts/page-context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export const Search = () => {
  const { setOffset, setSearch } = usePage()
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
