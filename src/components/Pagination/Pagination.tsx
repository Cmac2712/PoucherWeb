import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import { usePage } from '../../contexts/page-context'

export const Pagination = ({
}) => {

    const { perPage, offset, setOffset, count } = usePage()
    const pages = Math.ceil(count / perPage)
    const currentPage = Math.floor(offset / perPage) + 1

    return (

        <div className="flex basis-full max-w-3xl mt-auto">

            <div className="btn-group">
                <button
                    disabled={currentPage === 1}
                    onClick={() => {
                        setOffset(offset - perPage)
                    }}
                    className="btn btn-md"
                >
                    <FontAwesomeIcon icon={faAngleLeft} />
                </button>

                {Array.from(Array(pages), (e, i) => {
                    return (
                        <button
                            key={i}
                            onClick={() => {
                                setOffset(i * perPage)
                            }}
                            className={`btn btn-md ${currentPage === i + 1 ? 'btn-active' : ''}`}>
                            {i + 1}
                        </button>
                    )
                })}

                <button
                    disabled={currentPage === pages}
                    onClick={() => {
                        setOffset(offset + perPage)
                    }}
                    className="btn btn-md"
                >
                    <FontAwesomeIcon icon={faAngleRight} />
                </button>
            </div>
        </div>
    )
}