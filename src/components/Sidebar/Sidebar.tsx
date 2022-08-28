import { ReactNode } from 'react';
import { Profile } from '../Profile'
import { CreateBookmark } from '../CreateBookmark'

interface Props {
    top?: ReactNode | HTMLElement,
    bottom?: ReactNode | HTMLElement
}

export const Sidebar = ({
    top,
    bottom
}:Props) => {

    return (
       <nav
        id="sidebar"
        className="flex flex-col bg-gray-800 p-3 h-screen w-64 text-white"
       >
            <div className="sidebar-bottom mt-auto">
                 <Profile />
                { top }
            </div>
            <div className="sidebar-bottom mt-auto">
                <CreateBookmark />
                { bottom}
            </div>
       </nav> 
    )
}