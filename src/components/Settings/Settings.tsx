import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { usePreferencesStore } from '../../store/preferences-store'
import { useUser } from '../../contexts/user-context'
import { useUpdateUser } from '../../api/hooks'
import { useModalStore } from '../../store/modal-store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export const Settings = () => {
  const { theme, toggleTheme, displayName, setDisplayName } = usePreferencesStore()
  const { data } = useUser()
  const updateUser = useUpdateUser()
  const closeModal = useModalStore((s) => s.closeModal)

  const [nameInput, setNameInput] = useState(displayName)
  const [saved, setSaved] = useState(false)

  const handleSaveDisplayName = () => {
    setDisplayName(nameInput)
    if (data?.user.id) {
      updateUser.mutate({
        id: data.user.id,
        updates: { preferences: { displayName: nameInput } }
      })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleToggleTheme = () => {
    toggleTheme()
    const newTheme = theme === 'light' ? 'dark' : 'light'
    if (data?.user.id) {
      updateUser.mutate({
        id: data.user.id,
        updates: { preferences: { theme: newTheme } }
      })
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground dark:text-gray-100">
        Settings
      </h2>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground dark:text-gray-100">Dark Mode</p>
          <p className="text-sm text-foreground-muted dark:text-gray-400">
            Toggle between light and dark theme
          </p>
        </div>
        <button
          onClick={handleToggleTheme}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            theme === 'dark' ? 'bg-forest-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          <span
            className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-white transition-transform ${
              theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
            }`}
          >
            <FontAwesomeIcon
              icon={theme === 'dark' ? faMoon : faSun}
              className="h-2.5 w-2.5 text-gray-600"
            />
          </span>
        </button>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <div>
          <p className="font-medium text-foreground dark:text-gray-100">Display Name</p>
          <p className="text-sm text-foreground-muted dark:text-gray-400">
            How your name appears in the app
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter display name"
          />
          <Button
            onClick={handleSaveDisplayName}
            disabled={!nameInput.trim() || nameInput === displayName}
          >
            {saved ? 'Saved!' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Close button */}
      <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={closeModal}>
          Close
        </Button>
      </div>
    </div>
  )
}
