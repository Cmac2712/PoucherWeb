import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react'
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession
} from 'amazon-cognito-identity-js'

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || ''
})

export interface CognitoAuthUser {
  sub: string
  email: string
  name: string
  picture?: string
}

interface AuthContextType {
  user: CognitoAuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signUp: (email: string, password: string, name: string) => Promise<void>
  confirmSignUp: (email: string, code: string) => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useCognitoAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useCognitoAuth must be used within a CognitoAuthProvider')
  }
  return context
}

interface CognitoAuthProviderProps {
  children: ReactNode
}

export const CognitoAuthProvider = ({ children }: CognitoAuthProviderProps) => {
  const [user, setUser] = useState<CognitoAuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getUserAttributes = useCallback(
    (cognitoUser: CognitoUser): Promise<CognitoAuthUser> => {
      return new Promise((resolve, reject) => {
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err)
            return
          }

          const userAttrs: Record<string, string> = {}
          attributes?.forEach((attr) => {
            userAttrs[attr.getName()] = attr.getValue()
          })

          resolve({
            sub: userAttrs['sub'] || '',
            email: userAttrs['email'] || '',
            name: userAttrs['name'] || userAttrs['given_name'] || '',
            picture: userAttrs['picture']
          })
        })
      })
    },
    []
  )

  const checkSession = useCallback(async () => {
    const cognitoUser = userPool.getCurrentUser()

    if (!cognitoUser) {
      setUser(null)
      setIsLoading(false)
      return
    }

    cognitoUser.getSession(
      async (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session?.isValid()) {
          setUser(null)
          setIsLoading(false)
          return
        }

        try {
          const userAttrs = await getUserAttributes(cognitoUser)
          setUser(userAttrs)
        } catch {
          setUser(null)
        }
        setIsLoading(false)
      }
    )
  }, [getUserAttributes])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const login = async (email: string, password: string): Promise<void> => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    })

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    })

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async () => {
          try {
            const userAttrs = await getUserAttributes(cognitoUser)
            setUser(userAttrs)
            resolve()
          } catch (err) {
            reject(err)
          }
        },
        onFailure: (err) => {
          reject(err)
        },
        newPasswordRequired: () => {
          reject(new Error('New password required'))
        }
      })
    })
  }

  const logout = () => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) {
      cognitoUser.signOut()
    }
    setUser(null)
  }

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<void> => {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: name })
    ]

    return new Promise((resolve, reject) => {
      userPool.signUp(email, password, attributeList, [], (err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  const confirmSignUp = async (email: string, code: string): Promise<void> => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    })

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  const getAccessToken = async (): Promise<string | null> => {
    const cognitoUser = userPool.getCurrentUser()

    if (!cognitoUser) {
      return null
    }

    return new Promise((resolve) => {
      cognitoUser.getSession(
        (err: Error | null, session: CognitoUserSession | null) => {
          if (err || !session?.isValid()) {
            resolve(null)
            return
          }
          resolve(session.getAccessToken().getJwtToken())
        }
      )
    })
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signUp,
    confirmSignUp,
    getAccessToken
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
