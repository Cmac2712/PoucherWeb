import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import Constants from 'expo-constants'
import { initApiClient } from '@poucher/shared/api/client'
import { AuthProvider, useAuth } from '../contexts/auth-context'
import { ThemeProvider, useAppTheme } from '../theme/ThemeContext'

const extra = Constants.expoConfig?.extra ?? {}

// Initialize shared API client with mobile-specific config
// This must happen before any components render
let apiInitialized = false
function ensureApiClient(getToken: () => Promise<string | null>) {
  if (apiInitialized) return
  initApiClient({
    serverEndpoint: extra.serverEndpoint || '',
    getToken,
  })
  apiInitialized = true
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

function AuthGate() {
  const { isAuthenticated, isLoading, getAccessToken } = useAuth()
  const { theme, isDark } = useAppTheme()
  const segments = useSegments()
  const router = useRouter()

  // Initialize API client once we have the getAccessToken function
  useEffect(() => {
    ensureApiClient(getAccessToken)
  }, [getAccessToken])

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, isLoading, segments, router])

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Slot />
    </>
  )
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AuthGate />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
