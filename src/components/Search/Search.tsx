import { useState } from 'react';
import { usePage } from '../../contexts/page-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export const Search = () => {
    const { setOffset, setSearch } = usePage()
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <form
            className='flex'
            onSubmit={e => {
                e.preventDefault()
                setSearch(searchTerm)
                setSearchTerm("")
                setOffset(0)
            }}
        >
            <input 
                className="input input-bordered input-primary w-full max-w-xs rounded-none"
                type="text" 
                name="search" 
                placeholder="Search&hellip;"
                onChange={e => setSearchTerm(e.target.value)}
                value={searchTerm}
            />

            <button
                className="btn btn-square"
            >
                <FontAwesomeIcon icon={faSearch} />
            </button>
        </form>
    )
}