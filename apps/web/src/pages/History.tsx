import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiConfig } from '../utils/api'
import analytics from '../utils/analytics'

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

export default function History() {
  const [essays, setEssays] = useState<EssayHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'task1' | 'task2'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')
  const navigate = useNavigate()

  useEffect(() => {
    analytics.trackPageView('/history')
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await apiConfig.fetch('api/user/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEssays(data.items || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        setError('Failed to load essay history')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const deleteEssay = async (essayId: number) => {
    if (!confirm('Are you sure you want to delete this essay? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await apiConfig.fetch(`api/user/essays/${essayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setEssays(essays.filter(essay => essay.id !== essayId))
        analytics.trackFunnelStep('essay_deleted', { essayId })
      } else {
        alert('Failed to delete essay. Please try again.')
      }
    } catch (err) {
      alert('Network error. Please try again.')
    }
  }

  const filteredAndSortedEssays = essays
    .filter(essay => filter === 'all' || essay.taskType === filter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return b.overall - a.overall
      }
    })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBandColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600 bg-green-50'
    if (score >= 7.0) return 'text-blue-600 bg-blue-50'
    if (score >= 6.0) return 'text-yellow-600 bg-yellow-50'
    if (score >= 5.0) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const calculateStats = () => {
    if (essays.length === 0) return { average: 0, highest: 0, total: 0, thisMonth: 0 }
    
    const scores = essays.map(e => e.overall)
    const average = scores.reduce((a, b) => a + b, 0) / scores.length
    const highest = Math.max(...scores)
    
    const thisMonth = essays.filter(essay => {
      const essayDate = new Date(essay.createdAt)
      const now = new Date()
      return essayDate.getMonth() === now.getMonth() && 
             essayDate.getFullYear() === now.getFullYear()
    }).length

    return { average, highest, total: essays.length, thisMonth }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-slate-600">Loading your essay history...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-slate-800 mb-2">Oops! Something went wrong</div>
          <div className="text-slate-600 mb-4">{error}</div>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90"
          >
            Try Again
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
              <h1 className="text-3xl font-bold text-slate-800">Essay History</h1>
              <p className="text-slate-600 mt-1">
                Track your progress and review past analyses
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {stats.total}
            </div>
            <div className="text-sm text-slate-600">Total Essays</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {stats.average.toFixed(1)}
            </div>
            <div className="text-sm text-slate-600">Average Score</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {stats.highest.toFixed(1)}
            </div>
            <div className="text-sm text-slate-600">Highest Score</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {stats.thisMonth}
            </div>
            <div className="text-sm text-slate-600">This Month</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Task</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option value="all">All Tasks</option>
                  <option value="task1">Task 1 Only</option>
                  <option value="task2">Task 2 Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option value="date">Latest First</option>
                  <option value="score">Highest Score</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => navigate('/analyze')}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 font-medium"
            >
              + Analyze New Essay
            </button>
          </div>
        </div>

        {/* Essays List */}
        {filteredAndSortedEssays.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedEssays.map((essay) => (
              <div 
                key={essay.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-800 text-sm font-medium rounded-full">
                          {essay.taskType.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getBandColor(essay.overall)}`}>
                          Band {essay.overall.toFixed(1)}
                        </span>
                        <span className="text-sm text-slate-500">
                          {formatDate(essay.createdAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-lg font-semibold text-slate-800">{essay.bands.ta}</div>
                          <div className="text-xs text-slate-600">Task Achievement</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-lg font-semibold text-slate-800">{essay.bands.cc}</div>
                          <div className="text-xs text-slate-600">Coherence & Cohesion</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-lg font-semibold text-slate-800">{essay.bands.lr}</div>
                          <div className="text-xs text-slate-600">Lexical Resource</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-lg font-semibold text-slate-800">{essay.bands.gra}</div>
                          <div className="text-xs text-slate-600">Grammar Range & Accuracy</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>CEFR: {essay.cefr}</span>
                        <span>•</span>
                        <span>{essay.wordCount} words</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/result/${essay.publicId}`)}
                        className="px-3 py-2 text-brand hover:bg-brand/10 rounded-lg font-medium transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => deleteEssay(essay.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {filter === 'all' ? 'No essays yet' : `No ${filter} essays found`}
            </h3>
            <p className="text-slate-600 mb-6">
              {filter === 'all' 
                ? 'Start analyzing your IELTS essays to track your progress'
                : `Try changing the filter or analyze your first ${filter} essay`
              }
            </p>
            <button
              onClick={() => navigate('/analyze')}
              className="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 font-medium"
            >
              Analyze Your First Essay
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
