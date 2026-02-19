import { useState } from 'react'
import { useCognitoAuth, CognitoAuthUser } from '../../contexts/auth-context'
import { LogoutButton } from '../LogoutButton'
import { Bookmarks } from '../Bookmarks'
import { Splash } from '../Splash'
import { Tags } from '../Tags'
import { Pagination } from '../Pagination'
import { Profile } from '../Profile'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faGear } from '@fortawesome/free-solid-svg-icons'
import { Loader } from '../Loader/Loader'
import { Search } from '../Search'
import { Modal } from '../Modal'
import { UserProvider } from '../../contexts/user-context'
import { Drawer } from '../ui/drawer'
import { Button } from '../ui/button'
import { ThemeToggle } from '../ThemeToggle'
import { AddMenu } from '../AddMenu'
import { Settings } from '../Settings'
import { useModalStore } from '../../store/modal-store'

export type { CognitoAuthUser }

export const AdminScreen = () => {
  const { user, isAuthenticated, isLoading } = useCognitoAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { openModal, setModalContent } = useModalStore()

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

                <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-foreground-muted dark:text-gray-400 hover:text-foreground dark:hover:text-gray-100"
                    onClick={() => {
                      setModalContent(<Settings />)
                      openModal()
                    }}
                  >
                    <FontAwesomeIcon icon={faGear} />
                    Settings
                  </Button>
                  <LogoutButton />
                </div>
              </div>
            }
          >
            <div className="flex flex-col min-h-screen">
              {/* Header */}
              <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-4 px-4 lg:px-6 py-4">
                  {/* Mobile menu button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    className="lg:hidden shrink-0"
                  >
                    <FontAwesomeIcon icon={faBars} />
                  </Button>

                  {/* Logo */}
                  <span className="hidden sm:block text-lg font-bold text-forest-600 dark:text-forest-400 shrink-0">
                    Poucher.io
                  </span>

                  {/* Search - grows to fill space */}
                  <div className="flex-1 max-w-xl">
                    <Search />
                  </div>

                  {/* Theme toggle */}
                  <div className="shrink-0">
                    <ThemeToggle />
                  </div>

                  {/* Add menu */}
                  <div className="shrink-0">
                    <AddMenu />
                  </div>
                </div>
              </header>

              {/* Main content */}
              <main className="flex-1 p-4 lg:p-6">
                <Bookmarks />
              </main>

              {/* Footer */}
              <footer className="sticky bottom-0 z-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4">
                <div className="flex justify-center">
                  <Pagination />
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
