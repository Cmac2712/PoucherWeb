interface Props {
    url: string
}

export const Video = ({
    url
}:Props) => {

    return (
        <video controls width="250">
            <source src={url} type="video/mp4"/>
            Sorry, your browser doesn't support embedded videos.
        </video>
    )
}