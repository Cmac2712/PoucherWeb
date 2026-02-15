import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { usePreferencesStore } from '../../store/preferences-store'
import { Button } from '../ui/button'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = usePreferencesStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <FontAwesomeIcon
        icon={theme === 'light' ? faMoon : faSun}
        className="h-5 w-5"
      />
    </Button>
  )
}
