import { useState } from 'react'
import { usePageStore } from '../../store/page-store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

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
          <Input
            className="w-full max-w-xs rounded-r-none"
            type="text"
            name="search"
            autoComplete="off"
            placeholder="Search…"
            onChange={(e) => {
              setSearch(e.target.value)
              setSearchTerm(e.target.value)
            }}
            value={searchTerm}
          />

          <Button className="rounded-l-none">
            <FontAwesomeIcon icon={faSearch} />
          </Button>
        </form>
      </div>
      <Button size="icon" className="px-4 absolute top-0 bottom-0 m-auto right-4 h-12">
        <FontAwesomeIcon icon={faSearch} />
      </Button>
    </>
  )
}
