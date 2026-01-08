import * as React from "react"
import { cn } from "../../lib/utils"

interface DrawerProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Drawer: React.FC<DrawerProps> = ({ children, sidebar, open = false, onOpenChange }) => {
  const [isOpen, setIsOpen] = React.useState(open)

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onOpenChange?.(newState)
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 transform bg-background-dark border-r border-forest-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebar}
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={handleToggle}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

Drawer.displayName = "Drawer"
