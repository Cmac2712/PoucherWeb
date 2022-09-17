import { usePage } from '../../contexts/page-context'
import { useUser } from '../../contexts/user-context'
import { Loader } from '../Loader' 
import { TagsObj } from '../Bookmarks'

interface Props {
    callback?: () => void 
}

const Tags = ({
    callback
}: Props) => {
    const { setOffset, setSearch} = usePage()
    const { data } = useUser()

    if (!data) return <Loader /> 

    const tags:TagsObj = typeof data.createUser.tags === 'string' ? JSON.parse(data.createUser.tags) : data.createUser.tags 

    if (!tags) return <p>no tags</p>

    return (
        <div className="tags p-4 flex items-center">
            <h3 className="text-sm mr-4">Tags</h3>
            <div className="badges">
                {
                typeof tags === 'object' &&
                tags.list.map((tag, i) => {
                    return (
                        <button
                            key={i}
                            onClick={() => {
                                setSearch(tag)
                                setOffset(0)

                                if (callback) callback()
                            }}
                            className={`text-blue-500 underline gap-2 mr-2`}
                        >
                            { tag ? tag.split(':')[1] : '' }
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export { Tags }