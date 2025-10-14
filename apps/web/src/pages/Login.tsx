import { useState } from "react"

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        if (isLogin && data.token) {
          localStorage.setItem("token", data.token)
          alert("Login successful!")
        } else {
          alert("Account created! Please login.")
          setIsLogin(true)
        }
      } else {
        alert(data.error || "Authentication failed")
      }
    } catch (err) {
      alert("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container py-10 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-3">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-slate-600">
          {isLogin ? "Sign in to access your essay history" : "Sign up to save your analysis results"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
        >
          {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-brand hover:text-brand/80 font-medium"
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
        <strong>Note:</strong> Authentication requires a database connection. 
        Currently running in demo mode.
      </div>
    </section>
  )
}
