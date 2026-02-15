import create from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPreferences } from '../api/types'

type Theme = 'light' | 'dark'

interface PreferencesState {
  theme: Theme
  displayName: string
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setDisplayName: (name: string) => void
  hydrateFromBackend: (prefs: UserPreferences | undefined) => void
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      displayName: '',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        applyTheme(newTheme)
      },
      setDisplayName: (displayName) => {
        set({ displayName })
      },
      hydrateFromBackend: (prefs) => {
        if (!prefs) return
        const updates: Partial<PreferencesState> = {}
        if (prefs.theme) {
          updates.theme = prefs.theme
          applyTheme(prefs.theme)
        }
        if (prefs.displayName) {
          updates.displayName = prefs.displayName
        }
        set(updates)
      },
    }),
    {
      name: 'user-preferences',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)

export { usePreferencesStore }
export type { Theme }
