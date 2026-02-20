import create from 'zustand'
import { persist, StateStorage } from 'zustand/middleware'

type Theme = 'light' | 'dark'

let applyThemeFn: (theme: Theme) => void = () => {}

export function setThemeApplier(fn: (theme: Theme) => void) {
  applyThemeFn = fn
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

let customStorage: StateStorage | undefined

export function setThemeStorage(storage: StateStorage) {
  customStorage = storage
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme })
        applyThemeFn(theme)
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        applyThemeFn(newTheme)
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeFn(state.theme)
        }
      },
    }
  )
)

export { useThemeStore }
export type { Theme }
