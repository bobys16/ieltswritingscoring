import { createContext, useContext } from 'react'

interface User {
  id: number
  email: string
  name?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  login: (emailOrUsername: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext }
export type { User, AuthContextType }
