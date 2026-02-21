import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
  ICognitoStorage,
} from 'amazon-cognito-identity-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

// AsyncStorage adapter for Cognito session persistence
class CognitoAsyncStorage implements ICognitoStorage {
  private dataMemory: Record<string, string> = {}

  async sync(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys()
    const cognitoKeys = keys.filter((k) => k.startsWith('CognitoIdentityServiceProvider'))
    if (cognitoKeys.length > 0) {
      const items = await AsyncStorage.multiGet(cognitoKeys)
      items.forEach(([key, value]) => {
        if (value) this.dataMemory[key] = value
      })
    }
  }

  setItem(key: string, value: string): string {
    this.dataMemory[key] = value
    AsyncStorage.setItem(key, value)
    return value
  }

  getItem(key: string): string | null {
    return this.dataMemory[key] ?? null
  }

  removeItem(key: string): boolean {
    delete this.dataMemory[key]
    AsyncStorage.removeItem(key)
    return true
  }

  clear(): object {
    const keys = Object.keys(this.dataMemory).filter((k) =>
      k.startsWith('CognitoIdentityServiceProvider')
    )
    keys.forEach((key) => {
      delete this.dataMemory[key]
      AsyncStorage.removeItem(key)
    })
    return this.dataMemory
  }
}

const cognitoStorage = new CognitoAsyncStorage()

const extra = Constants.expoConfig?.extra ?? {}

const userPool = new CognitoUserPool({
  UserPoolId: extra.cognitoUserPoolId || '',
  ClientId: extra.cognitoClientId || '',
  Storage: cognitoStorage,
})

export interface AuthUser {
  sub: string
  email: string
  name: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signUp: (email: string, password: string, name: string) => Promise<void>
  confirmSignUp: (email: string, code: string) => Promise<void>
  getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getUserAttributes = useCallback(
    (cognitoUser: CognitoUser): Promise<AuthUser> =>
      new Promise((resolve, reject) => {
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err)
            return
          }
          const attrs: Record<string, string> = {}
          attributes?.forEach((attr) => {
            attrs[attr.getName()] = attr.getValue()
          })
          resolve({
            sub: attrs['sub'] || '',
            email: attrs['email'] || '',
            name: attrs['name'] || attrs['given_name'] || '',
          })
        })
      }),
    []
  )

  const storeTokens = useCallback(async (session: CognitoUserSession) => {
    const accessToken = session.getAccessToken().getJwtToken()
    const idToken = session.getIdToken().getJwtToken()
    const refreshToken = session.getRefreshToken().getToken()
    await SecureStore.setItemAsync('accessToken', accessToken)
    await SecureStore.setItemAsync('idToken', idToken)
    await SecureStore.setItemAsync('refreshToken', refreshToken)
  }, [])

  const clearTokens = useCallback(async () => {
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('idToken')
    await SecureStore.deleteItemAsync('refreshToken')
  }, [])

  const checkSession = useCallback(async () => {
    try {
      await cognitoStorage.sync()
    } catch {
      // Storage sync failed, proceed without cached session
    }

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
          await storeTokens(session)
          const userAttrs = await getUserAttributes(cognitoUser)
          setUser(userAttrs)
        } catch {
          setUser(null)
        }
        setIsLoading(false)
      }
    )
  }, [getUserAttributes, storeTokens])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
        Storage: cognitoStorage,
      })
      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      })

      return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authDetails, {
          onSuccess: async (session) => {
            try {
              await storeTokens(session)
              const userAttrs = await getUserAttributes(cognitoUser)
              setUser(userAttrs)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          onFailure: (err) => reject(err),
          newPasswordRequired: () =>
            reject(new Error('New password required')),
        })
      })
    },
    [getUserAttributes, storeTokens]
  )

  const logout = useCallback(() => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) {
      cognitoUser.signOut()
    }
    clearTokens()
    setUser(null)
  }, [clearTokens])

  const signUp = useCallback(
    async (email: string, password: string, name: string): Promise<void> => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'name', Value: name }),
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
    },
    []
  )

  const confirmSignUp = useCallback(
    async (email: string, code: string): Promise<void> => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
        Storage: cognitoStorage,
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
    },
    []
  )

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const token = await SecureStore.getItemAsync('accessToken')
    if (token) return token

    const cognitoUser = userPool.getCurrentUser()
    if (!cognitoUser) return null

    return new Promise((resolve) => {
      cognitoUser.getSession(
        async (err: Error | null, session: CognitoUserSession | null) => {
          if (err || !session?.isValid()) {
            resolve(null)
            return
          }
          await storeTokens(session)
          resolve(session.getAccessToken().getJwtToken())
        }
      )
    })
  }, [storeTokens])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signUp,
        confirmSignUp,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
