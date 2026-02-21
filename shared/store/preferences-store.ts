import create from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPreferences } from '../api/types'

type Theme = 'light' | 'dark'

let applyThemeFn: (theme: Theme) => void = () => {}

export function setPreferencesThemeApplier(fn: (theme: Theme) => void) {
  applyThemeFn = fn
}

interface PreferencesState {
  theme: Theme
  displayName: string
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setDisplayName: (name: string) => void
  hydrateFromBackend: (prefs: UserPreferences | undefined) => void
}

const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      displayName: '',
      setTheme: (theme) => {
        set({ theme })
        applyThemeFn(theme)
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        applyThemeFn(newTheme)
      },
      setDisplayName: (displayName) => {
        set({ displayName })
      },
      hydrateFromBackend: (prefs) => {
        if (!prefs) return
        const updates: Partial<PreferencesState> = {}
        if (prefs.theme) {
          updates.theme = prefs.theme
          applyThemeFn(prefs.theme)
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
          applyThemeFn(state.theme)
        }
      },
    }
  )
)

export { usePreferencesStore }
export type { Theme }
