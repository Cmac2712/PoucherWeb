import { useContext, createContext, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'
import { useUserInit } from '@poucher/shared/api/hooks'
import type { User, Tag } from '@poucher/shared/api/types'

interface UserProviderProps {
  children: ReactNode
}

type UserContextProps = {
  loading: boolean
  error: Error | null
  data:
    | {
        user: User
        tags: Tag[]
      }
    | undefined
}

const UserContext = createContext<UserContextProps | undefined>(undefined)

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export function UserProvider({ children }: UserProviderProps) {
  const { user } = useAuth()

  const { data, isLoading, error } = useUserInit({
    id: user?.sub,
    email: user?.email,
    name: user?.name,
  })

  const value: UserContextProps = {
    loading: isLoading,
    error: error as Error | null,
    data: data
      ? {
          user: data.user,
          tags: data.tags,
        }
      : undefined,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
