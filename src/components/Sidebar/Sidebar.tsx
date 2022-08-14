import { CreateBookmark } from "../CreateBookmark"

export const Sidebar = () => {

    return (
       <nav
        id="sidebar"
        className="flex flex-col bg-gray-800 fixed p-3 top-0 left-0 h-screen w-64 text-white"
       >
            <h1 className="">My Bookmarks</h1>
            <a href="">I am a sidebar</a>

            <div className="sidebar-bottom mt-auto">
                <CreateBookmark />
            </div>
       </nav> 
    )
}