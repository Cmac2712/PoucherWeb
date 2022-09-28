import { useQuery, gql, ApolloError } from '@apollo/client'
import { useContext, createContext } from 'react'
import { ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

interface UserProviderProps {
  children: ReactNode
}

type UserContextProps =
  | {
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
    }
  | undefined

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

export const UserProvider = ({ children }: UserProviderProps) => {
  const { user } = useAuth0()
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

  const value: UserContextProps = {
    loading,
    error,
    data
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
