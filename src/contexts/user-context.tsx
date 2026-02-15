import { useContext, createContext, useEffect, ReactNode } from 'react'
import { useCognitoAuth } from './auth-context'
import { useUserInit } from '../api/hooks'
import { usePreferencesStore } from '../store/preferences-store'
import type { User, Tag } from '../api/types'

interface UserProviderProps {
  children: ReactNode
}

type UserContextProps =
  | {
      loading: boolean
      error: Error | null
      data:
        | {
            user: User
            tags: Tag[]
          }
        | undefined
    }
  | undefined

const UserContext = createContext<UserContextProps>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { user } = useCognitoAuth()

  const { data, isLoading, error } = useUserInit({
    id: user?.sub,
    email: user?.email,
    name: user?.name
  })

  const hydrateFromBackend = usePreferencesStore((s) => s.hydrateFromBackend)

  useEffect(() => {
    if (data?.user?.preferences) {
      hydrateFromBackend(data.user.preferences)
    }
  }, [data?.user?.preferences, hydrateFromBackend])

  const value: UserContextProps = {
    loading: isLoading,
    error: error as Error | null,
    data: data
      ? {
          user: data.user,
          tags: data.tags
        }
      : undefined
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
