import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface EssayHistory {
  id: number
  publicId: string
  taskType: string
  overall: number
  cefr: string
  createdAt: string
  bands: {
    ta: number
    cc: number
    lr: number
    gra: number
  }
  wordCount: number
}

interface UserStats {
  totalEssays: number
  averageScore: number
  monthlyCount: number
  improvement: string
  recentScores: number[]
}

interface UserDashboard {
  user: {
    email: string
    plan: string
    joinedAt: string
  }
  stats: UserStats
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null)
  const [history, setHistory] = useState<EssayHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboard()
    fetchHistory()
  }, [])

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch('/api/user/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboard(data)
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        setError('Failed to load dashboard')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/user/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setHistory(data.items || [])
      }
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getImprovementColor = (improvement: string) => {
    switch (improvement) {
      case 'improving':
        return 'text-green-600 bg-green-50'
      case 'declining':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-brand text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
              <p className="text-slate-600 mt-1">
                Welcome back, {dashboard?.user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-brand/10 text-brand text-sm font-medium rounded-full">
                {dashboard?.user.plan || 'Free'} Plan
              </span>
              <button
                onClick={() => {
                  // Use global feedback trigger function
                  if ((window as any).triggerFeedback) {
                    (window as any).triggerFeedback()
                  }
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                title="Test Feedback Modal"
              >
                💭 Feedback
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {dashboard?.stats.totalEssays || 0}
            </div>
            <div className="text-sm text-slate-600">Total Essays</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {dashboard?.stats.averageScore?.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-slate-600">Average Score</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {dashboard?.stats.monthlyCount || 0}
            </div>
            <div className="text-sm text-slate-600">This Month</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              getImprovementColor(dashboard?.stats.improvement || 'stable')
            }`}>
              {dashboard?.stats.improvement || 'stable'}
            </div>
            <div className="text-sm text-slate-600 mt-1">Trend</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Essays */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-800">Recent Essays</h2>
            </div>
            <div className="p-6">
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.slice(0, 5).map((essay) => (
                    <div 
                      key={essay.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/result/${essay.publicId}`)}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-800">
                            {essay.taskType.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDate(essay.createdAt)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          {essay.cefr} Level • {essay.wordCount} words
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-800">
                          {essay.overall.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">Overall</div>
                      </div>
                    </div>
                  ))}
                  {history.length > 5 && (
                    <button 
                      onClick={() => navigate('/history')}
                      className="w-full py-2 text-brand font-medium hover:text-brand/80"
                    >
                      View All Essays ({history.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">No essays yet</p>
                  <button
                    onClick={() => navigate('/analyze')}
                    className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90"
                  >
                    Analyze Your First Essay
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-800">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => navigate('/analyze')}
                className="w-full p-4 bg-gradient-to-r from-brand to-blue-600 text-white rounded-lg hover:from-brand/90 hover:to-blue-600/90 transition-all"
              >
                <div className="text-left">
                  <div className="font-semibold mb-1">Analyze New Essay</div>
                  <div className="text-sm opacity-90">
                    Get instant band scores and feedback
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/history')}
                className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="text-left">
                  <div className="font-semibold mb-1 text-slate-800">View History</div>
                  <div className="text-sm text-slate-600">
                    See all your previous analyses
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="text-left">
                  <div className="font-semibold mb-1 text-slate-800">Profile Settings</div>
                  <div className="text-sm text-slate-600">
                    Update your account information
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
