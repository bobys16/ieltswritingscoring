import { Outlet, Link } from "react-router-dom"
import { useState, useEffect } from "react"

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <header 
        className="border-b border-slate-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50" 
        role="banner"
      >
        <nav 
          className="container h-16 flex items-center justify-between" 
          role="navigation" 
          aria-label="Main navigation"
        >
          <Link 
            to="/" 
            className="text-xl font-bold bg-gradient-to-r from-brand to-blue-600 bg-clip-text text-transparent focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-1"
            aria-label="IELTS Band Estimator - Home"
          >
            IELTS Band Estimator
          </Link>
          
          {/* Desktop navigation */}
                    <div className="flex gap-6 text-sm">
            <Link to="/analyze" className="hover:text-brand transition-colors">Analyze</Link>
            <Link to="/blog" className="hover:text-brand transition-colors">Blog</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-brand transition-colors">Dashboard</Link>
                <Link to="/history" className="hover:text-brand transition-colors">History</Link>
                <Link to="/profile" className="hover:text-brand transition-colors">Profile</Link>
                <button 
                  onClick={logout}
                  className="hover:text-brand transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-brand transition-colors">Login</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden border-t border-slate-100 bg-white"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="container py-4 space-y-4">
              <Link 
                to="/analyze" 
                className="block text-slate-700 hover:text-brand font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
                role="menuitem"
              >
                Analyze Essay
              </Link>
              <Link 
                to="/blog" 
                className="block text-slate-700 hover:text-brand font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
                role="menuitem"
              >
                Blog & Tips
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block text-slate-700 hover:text-brand font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/history" 
                    className="block text-slate-700 hover:text-brand font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                  >
                    History
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block text-slate-700 hover:text-brand font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:border-brand hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2"
                    role="menuitem"
                    aria-label="Sign out of your account"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="block px-4 py-2 bg-brand text-white font-medium rounded-lg hover:bg-brand/90 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:ring-offset-2"
                  onClick={() => setMobileMenuOpen(false)}
                  role="menuitem"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      
      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>
      
      <footer className="border-t border-slate-100 bg-slate-50" role="contentinfo">
        <div className="container py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="text-xl font-bold bg-gradient-to-r from-brand to-blue-600 bg-clip-text text-transparent mb-4">
                IELTS Band Estimator
              </div>
              <p className="text-slate-600 mb-4 max-w-md">
                Get instant, accurate IELTS Writing band predictions with our AI-powered examiner. Improve your scores with detailed feedback.
              </p>
              <div className="flex gap-4" role="list" aria-label="Social media links">
                <a 
                  href="https://twitter.com/ieltsestimator" 
                  className="text-slate-400 hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md p-1"
                  aria-label="Follow us on Twitter"
                  role="listitem"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com/company/ielts-estimator" 
                  className="text-slate-400 hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md p-1"
                  aria-label="Connect with us on LinkedIn"
                  role="listitem"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-4">Product</h3>
              <ul className="space-y-2 text-slate-600" role="list">
                <li role="listitem">
                  <Link 
                    to="/analyze" 
                    className="hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-1"
                  >
                    Analyze Essay
                  </Link>
                </li>
                <li role="listitem">
                  <a 
                    href="#how-it-works" 
                    className="hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-1"
                  >
                    How it Works
                  </a>
                </li>
                <li role="listitem">
                  <a 
                    href="/pricing" 
                    className="hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-1"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-800 mb-4">Support</h3>
              <ul className="space-y-2 text-slate-600" role="list">
                <li role="listitem">
                  <a 
                    href="/help" 
                    className="hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-1"
                  >
                    Help Center
                  </a>
                </li>
                <li role="listitem">
                  <a 
                    href="/contact" 
                    className="hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-1"
                  >
                    Contact Us
                  </a>
                </li>
                <li role="listitem">
                  <a 
                    href="/privacy" 
                    className="hover:text-brand transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 rounded-md px-1"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-slate-500">
            <p>© {new Date().getFullYear()} IELTS Band Estimator. All rights reserved.</p>
            <p className="mt-1 text-sm">Improve your IELTS Writing faster with 95% accuracy • Trusted by 25,000+ students</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
