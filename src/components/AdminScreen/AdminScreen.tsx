import { useAuth0 } from "@auth0/auth0-react";
import { LoginButton } from "../LoginButton";
import { LogoutButton } from '../LogoutButton'
import { Bookmarks } from '../Bookmarks'
import { Profile } from "../Profile";
import { CreateBookmark } from "../CreateBookmark";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'

export const AdminScreen = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex column items-center justify-center h-screen gradient-brand">
        <header className="fixed w-full flex justify-end top-0 p-2">
            <LoginButton />
        </header>
        <h1 className="text-5xl font-bold text-white">Bookmarks</h1>
      </div>
    ) 
  }

  if (isAuthenticated) {
    return (
      <>
        <div className="drawer drawer-mobile">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content p-5 pt-20 lg:pt-5 flex flex-col items-center">

            <label htmlFor="my-drawer-2" className="btn btn-ghost fixed left-5 top-5 drawer-button lg:hidden">
              <FontAwesomeIcon icon={faBars} />
            </label>

            <Bookmarks authorID={user?.sub} />

          </div> 
          <div className="drawer-side">
            <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
            <ul className="menu d-flex flex-col overflow-y-auto w-80 text-base-content bg-base-200">
              <li className="bg-base-300">
                <Profile />
              </li>

            <div className="toolbar mt-auto mx-5">
              <CreateBookmark />
            </div>
          
              <li className="p-4">
                <LogoutButton />
              </li>
            </ul>
          </div>
        </div>
      </>
    )
  }

return <></>
};