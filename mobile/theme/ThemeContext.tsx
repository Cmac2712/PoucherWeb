import { createContext, useContext, useMemo, ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { usePreferencesStore } from '@poucher/shared/store/preferences-store'
import { lightTheme, darkTheme, type AppTheme } from './colors'

interface ThemeContextValue {
  theme: AppTheme
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
})

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const storedTheme = usePreferencesStore((s) => s.theme)

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = storedTheme === 'dark'
    return {
      theme: isDark ? darkTheme : lightTheme,
      isDark,
    }
  }, [storedTheme])

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}
