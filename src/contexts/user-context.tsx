import { useQuery, gql, ApolloError } from "@apollo/client"
import { useContext, createContext, } from "react"
import { ReactNode } from 'react'
import { Auth0User } from '../components/AdminScreen'
import { TagsObj } from "../components/Bookmarks"

interface UserProviderProps {
  children: ReactNode
  user: Auth0User
}

type UserContextProps = {
  loading: boolean
  error: ApolloError | undefined
  data: {
    createUser: {
      id: string
      email: string
      name: string
      tags: TagsObj 
    }
  }
} | undefined

export const CREATE_USER = gql`
  query CreateUser($user: UserInput) {
    createUser(user: $user) {
      id
      tags
    }
  }
`

const UserContext = createContext<UserContextProps>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}

export const UserProvider = ({ children, user }: UserProviderProps) => {
  const { loading, error, data } = useQuery(CREATE_USER, {
    variables: {
      user: {
        id: user?.sub,
        email: user?.email,
        name: user?.given_name
      }
    }
  })

  const value:UserContextProps = {
    loading,
    error,
    data
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}