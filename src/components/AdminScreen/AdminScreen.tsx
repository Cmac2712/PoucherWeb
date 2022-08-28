import { useAuth0 } from "@auth0/auth0-react";
import { Sidebar } from '../Sidebar'
import { LogoutButton } from '../LogoutButton'
import { Bookmarks } from '../Bookmarks'

export const AdminScreen = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  if (isAuthenticated) {
    return (
      <div className='flex bg-gray-50'>
        <LogoutButton/>
          <Sidebar />
          <div className='h-screen overflow-scroll'>
            <Bookmarks 
              authorID={user?.sub}
            />
          </div>
      </div>
    )
  }

  return <></>
};