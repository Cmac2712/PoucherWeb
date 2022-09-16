import { usePage } from '../../contexts/page-context'
import { useUser } from '../../contexts/user-context'
import { displayTag } from '../../utils/tags'
import { Loader } from '../Loader' 

interface Props {
    callback?: () => any
}

const Tags = ({
    callback
}: Props) => {
    const { setOffset, setSearch} = usePage()
    const { data } = useUser()

    if (!data) return <Loader /> 

    const tags = JSON.parse(data.createUser.tags)?.list

    if (!tags) return <p>no tags</p>

    return (
        <div className="tags p-4 flex items-center">
            <h3 className="text-sm mr-4">Tags</h3>
            <div className="badges">
                {tags.map((tag, i) => {
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