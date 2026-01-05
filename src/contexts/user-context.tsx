import { useContext, createContext, ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useUserInit } from '../api/hooks'
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
  const { user } = useAuth0()

  const { data, isLoading, error } = useUserInit({
    id: user?.sub,
    email: user?.email,
    name: user?.given_name
  })

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
