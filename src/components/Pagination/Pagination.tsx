import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import { usePageStore } from '../../store/page-store'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

export const Pagination = () => {
  const perPage = usePageStore((state) => state.perPage)
  const offset = usePageStore((state) => state.offset)
  const setOffset = usePageStore((state) => state.setOffset)
  const count = usePageStore((state) => state.count)
  const pages = count ? Math.ceil(count / perPage) : 1
  const currentPage = Math.floor(offset / perPage) + 1

  if (pages <= 1) return null

  return (
    <div className="flex basis-full max-w-3xl">
      <div className="flex flex-nowrap gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => {
            setOffset(offset - perPage)
          }}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="md:hidden"
        >
          Page {currentPage}
        </Button>

        {Array.from(Array(pages), (e, i) => {
          return (
            <Button
              key={i}
              size="sm"
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => {
                setOffset(i * perPage)
              }}
              className="hidden md:block"
            >
              {i + 1}
            </Button>
          )
        })}

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === pages}
          onClick={() => {
            setOffset(offset + perPage)
          }}
        >
          <FontAwesomeIcon icon={faAngleRight} />
        </Button>
      </div>
    </div>
  )
}
