import { useState } from 'react';
import { usePage } from '../../contexts/page-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faClose } from '@fortawesome/free-solid-svg-icons'

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

export const Search = () => {
    const [open, setOpen] = useState(false)
    const { setOffset, setSearch } = usePage()
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <>
            <div className={`flex relative bottom-20 left-12 m-auto h-12 z-10 ${open ? 'slide-in' : 'slide-out'}`}>
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
                    onSubmit={e => {
                        e.preventDefault()
                        setSearchTerm("")
                        setOffset(0)
                    }}
                >
                    <input
                        className="input input-bordered input-primary w-full max-w-xs rounded-none"
                        type="text"
                        name="search"
                        placeholder="Search&hellip;"
                        onChange={e => {
                            setSearch(e.target.value)
                            setSearchTerm(e.target.value)
                        }}
                        value={searchTerm}
                    />

                    <button
                        className="btn btn-square"
                    >
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </form>
            </div>
            <button
                className="btn btn-square px-4 absolute top-0 bottom-0 m-auto right-4 h-12"
                onClick={() => setOpen(!open)}
            >
                <FontAwesomeIcon icon={faSearch} />
            </button>
        </>
    )
}