import { useQuery, gql, ApolloError } from "@apollo/client"
import { useContext, createContext, } from "react"
import { ReactNode } from 'react'
import { Auth0User } from '../components/AdminScreen'

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
    }
    getTags: {
      authorID: string
      ID: string
      bookmarkID: string
      title: string
    }[]
  }
} | undefined

export const CREATE_USER = gql`
  query CreateUser($user: UserInput) {
    createUser(user: $user) {
      id
    }
    getTags(user: $user) {
      ID 
      authorID
      bookmarkID
      title
    }
  }
`

export const GET_USER_TAGS = gql`
  query GetUserTags($input: TagInput) {
    getTags(tag: $input) {
      id
      bookmarkID
      title
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
      },
      input: {
        user: {
          id: user?.sub
        }
      }
    }
  })

  console.log('data: ', data)

  const value:UserContextProps = {
    loading,
    error,
    data
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}