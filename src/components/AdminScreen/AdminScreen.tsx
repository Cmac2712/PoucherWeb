import { useAuth0 } from '@auth0/auth0-react'
import { LogoutButton } from '../LogoutButton'
import { Bookmarks } from '../Bookmarks'
import { CreateBookmark } from '../CreateBookmark'
import { Splash } from '../Splash'
import { Tags } from '../Tags'
import { Pagination } from '../Pagination'
import { Profile } from '../Profile'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { Loader } from '../Loader/Loader'
import { Search } from '../Search'
import { Modal } from '../Modal'
import { PageProvider } from '../../contexts/page-context'
import { UserProvider } from '../../contexts/user-context'
import { ModalProvider } from '../../contexts/modal-context'

export interface Auth0User {
  sub: string
  email: string
  given_name: string
  picture: string
}

export const AdminScreen = () => {
  const { user, isAuthenticated, isLoading } = useAuth0<Auth0User>()

  if (isLoading) return <Loader />

  if (!isAuthenticated) {
    return <Splash />
  }

  if (isAuthenticated && user) {
    return (
      <>
        <UserProvider user={user}>
          <PageProvider>
            <ModalProvider>
              <div className="drawer drawer-mobile">
                <input
                  id="my-drawer-2"
                  type="checkbox"
                  className="drawer-toggle"
                />
                <div className="drawer-content pt-24 mb-20 flex flex-col relative">
                  <label
                    htmlFor="my-drawer-2"
                    className="btn btn-ghost fixed z-50 left-5 top-5 drawer-button lg:hidden"
                  >
                    <FontAwesomeIcon icon={faBars} />
                  </label>

                  <header className="fixed flex justify-end z-20 top-0 right-0 left-0 p-4 px-4 bg-base-200">
                    <Search />
                  </header>

                  <Bookmarks />

                  <footer className="fixed flex flex-row justify-between bottom-0 left-0 lg:left-80 right-0 bg-base-300 p-4 w-100 border-t-2 border-base-100">
                    <div className="relative z-20 h-12">
                      <Pagination />
                    </div>
                    <div className="absolute right-20 z-10"></div>
                    <div className="absolute right-4">
                      <CreateBookmark />
                    </div>
                  </footer>
                </div>
                <div className="drawer-side">
                  <label
                    htmlFor="my-drawer-2"
                    className="drawer-overlay"
                  ></label>
                  <div className="menu d-flex flex-col overflow-y-auto w-80 text-base-content bg-base-200">
                    <div>
                      {user && (
                        <>
                          <Profile user={user} />
                          <Tags />
                        </>
                      )}
                    </div>

                    <div className="p-4 mt-auto">
                      <LogoutButton />
                    </div>
                  </div>
                </div>
              </div>
              <Modal />
            </ModalProvider>
          </PageProvider>
        </UserProvider>
      </>
    )
  }

  return <></>
}
