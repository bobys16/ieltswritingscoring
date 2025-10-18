import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, signup } = useAuth()

  // Get the redirect path from location state, default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Use AuthProvider login method
        await login(email, password)
        navigate(from, { replace: true })
      } else {
        // Use AuthProvider signup method
        await signup(email, password)
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <img 
              src="/logo_name.png" 
              alt="BandLy" 
              className="h-10 w-auto mx-auto mb-4"
            />
          </div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-600">
              {isLogin 
                ? 'Sign in to access your essay history and dashboard' 
                : 'Join thousands improving their IELTS scores'
              }
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs text-brand hover:text-brand/80"
                    onClick={() => {
                      // TODO: Implement forgot password functionality
                      alert('Forgot password feature coming soon!')
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
              {!isLogin && (
                <p className="text-xs text-slate-500 mt-1">
                  Minimum 6 characters required
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-brand to-blue-600 text-white font-semibold rounded-lg hover:from-brand/90 hover:to-blue-600/90 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand hover:text-brand/80 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
            
            {/* Terms and Privacy for Sign Up */}
            {!isLogin && (
              <p className="text-xs text-slate-500 mt-3">
                By creating an account, you agree to our{' '}
                <a href="/terms" className="text-brand hover:text-brand/80" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-brand hover:text-brand/80" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </p>
            )}
          </div>

          {/* Benefits for signup */}
          {!isLogin && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-slate-800 mb-2">Free Account Benefits:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-brand rounded-full"></div>
                  Save your essay history
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-brand rounded-full"></div>
                  Track score improvements
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-brand rounded-full"></div>
                  10 analyses per hour (vs 3 for anonymous)
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
