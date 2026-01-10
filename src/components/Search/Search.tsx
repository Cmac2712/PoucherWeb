import { useState } from 'react'
import { usePageStore } from '../../store/page-store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { Input } from '../ui/input'

export const Search = () => {
  const setSearch = usePageStore((state) => state.setSearch)
  const setOffset = usePageStore((state) => state.setOffset)

  const [searchTerm, setSearchTerm] = useState('')

  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault()
        setOffset(0)
      }}
    >
      <FontAwesomeIcon
        icon={faSearch}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
      />
      <Input
        className="w-full pl-10"
        type="text"
        name="search"
        autoComplete="off"
        placeholder="Search bookmarks..."
        onChange={(e) => {
          setSearch(e.target.value)
          setSearchTerm(e.target.value)
        }}
        value={searchTerm}
      />
    </form>
  )
}
