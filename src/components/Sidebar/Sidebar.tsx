import { CreateBookmark } from "../CreateBookmark"

export const Sidebar = () => {

    return (
       <nav
        id="sidebar"
        className="flex flex-col bg-gray-800 p-3 h-screen w-64 text-white"
       >
            <h1 className="">My Bookmarks</h1>
            <a href="">I am a sidebar</a>

            <div className="sidebar-bottom mt-auto">
                <CreateBookmark />
            </div>
       </nav> 
    )
}