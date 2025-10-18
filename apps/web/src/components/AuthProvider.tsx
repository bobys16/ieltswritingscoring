import { useState, useEffect, ReactNode } from 'react'
import { User, AuthContext } from '../hooks/useAuth'
import { apiConfig } from '../utils/api'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token')
    if (token) {
      // Optionally verify token with backend
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchUserProfile() {
    try {
      const response = await apiConfig.fetch('api/auth/profile')
      
      if (response.ok) {
        const userData = await response.json()
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.email.split('@')[0], // Use email prefix as name
          role: userData.role
        })
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  async function login(emailOrUsername: string, password: string) {
    // Determine if the input is an email or username
    const isEmail = emailOrUsername.includes('@')
    const requestBody = isEmail 
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password } // Use username field for non-email inputs
    
    const response = await apiConfig.fetch('api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await response.json()
    localStorage.setItem('token', data.token)
    setUser({
      id: data.user.id,
      email: data.user.email,
      name: data.user.email.split('@')[0], // Use email prefix as name since backend doesn't provide name
      role: data.user.role
    })
  }

  async function signup(email: string, password: string, name?: string) {
    const response = await apiConfig.fetch('api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Signup failed')
    }

    const data = await response.json()
    localStorage.setItem('token', data.token)
    setUser({
      id: data.user.id,
      email: data.user.email,
      name: data.user.email.split('@')[0], // Use email prefix as name since backend doesn't provide name
      role: data.user.role
    })
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
