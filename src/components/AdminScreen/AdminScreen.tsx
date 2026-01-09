import { useState } from 'react'
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
import { UserProvider } from '../../contexts/user-context'
import { Drawer } from '../ui/drawer'
import { Button } from '../ui/button'

export interface Auth0User {
  sub: string
  email: string
  given_name: string
  picture: string
}

export const AdminScreen = () => {
  const { user, isAuthenticated, isLoading } = useAuth0<Auth0User>()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (isLoading) return <Loader />

  if (!isAuthenticated) {
    return <Splash />
  }

  if (isAuthenticated && user) {
    return (
      <>
        <UserProvider>
          <Drawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            sidebar={
              <div className="flex flex-col h-full overflow-y-auto text-foreground">
                {user && (
                  <>
                    <Profile user={user} />
                    <Tags />
                  </>
                )}

                <div className="p-4 mt-auto">
                  <LogoutButton />
                </div>
              </div>
            }
          >
            <div className="pt-24 mb-20 flex flex-col relative min-h-screen">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="fixed z-50 left-5 top-5 lg:hidden"
              >
                <FontAwesomeIcon icon={faBars} />
              </Button>

              <header className="fixed flex justify-end z-20 top-0 right-0 left-0 lg:left-80 p-4 px-4 bg-background-dark border-b border-forest-800">
                <Search />
              </header>

              <Bookmarks />

              <footer className="fixed flex flex-row justify-between bottom-0 left-0 lg:left-80 right-0 bg-background-darker p-4 w-100 border-t-2 border-forest-800">
                <div className="relative z-20 h-12">
                  <Pagination />
                </div>
                <div className="absolute right-20 z-10"></div>
                <div className="absolute right-4">
                  <CreateBookmark />
                </div>
              </footer>
            </div>
          </Drawer>
          <Modal />
        </UserProvider>
      </>
    )
  }

  return <></>
}
