import { usePage } from '../../contexts/page-context'
import { useUser } from '../../contexts/user-context'
import { Loader } from '../Loader'
import { CreateTag } from '../CreateTag'

export type Tag = {
  ID: string
  authorID: string
  bookmarkID: string
  title: string
}

interface Props {
  callback?: () => void
}

const Tags = ({ callback }: Props) => {
  const { setOffset, setSearch } = usePage()
  const { data: { getTags: tags } = { getTags: [] }, loading } = useUser()

  if (loading) return <Loader />

  return (
    <div className="tags p-4 flex items-center">
      <h3 className="text-sm mr-4">Tags</h3>
      <div className="badges">
        {tags.map(({ title }, i) => {
          return (
            <button
              key={i}
              onClick={() => {
                setSearch(title)
                setOffset(0)

                if (callback) callback()
              }}
              className={`text-blue-500 underline gap-2 mr-2`}
            >
              {title}
            </button>
          )
        })}
      </div>
      <CreateTag />
    </div>
  )
}

export { Tags }
