import { useQuery, gql } from "@apollo/client"
import { useState, useContext, createContext, } from "react"
import { ReactNode } from 'react'
import { Auth0User } from '../components/AdminScreen'

interface UserProviderProps {
  children: ReactNode
  user: Auth0User
}

type UserContextProps = {
  loading: boolean
  error: string
  data: {
    createUser: {
      id: string
      tags: string 
      email: string
      name: string
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

  const value = {
    loading,
    error,
    data
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}