import './Loader.css'

interface Props  {
    size?: string
}

export const Loader = ({
    size
}:Props) => {
    return (
        <div className="loader"><div></div><div></div><div></div><div></div></div>
    )
}