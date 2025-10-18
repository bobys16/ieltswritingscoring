import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import analytics from '../utils/analytics'
import { useFeedback } from '../hooks/useFeedback'
import { apiConfig } from '../utils/api'

export default function Analyze() {
  const [text, setText] = useState("")
  const [taskType, setTaskType] = useState<"task1"|"task2">("task2")
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'info' | 'warning' | 'error' | 'success'
    message: string
    showLoginSuggestion?: boolean
  } | null>(null)
  const nav = useNavigate()
  const { triggerOnFeatureUse } = useFeedback()

  useEffect(() => {
    analytics.trackPageView('/analyze')
    analytics.trackFunnelStep('analyze_page_visit')
  }, [])

  const words = text.trim().split(/\s+/).filter(Boolean).length
  const isValidLength = words >= 150 && words <= 320

  const dismissNotification = () => setNotification(null)

  async function onAnalyze() {
    if (!isValidLength) { 
      setNotification({
        type: 'warning',
        message: "Essay must be 150–320 words."
      })
      return 
    }
    
    setLoading(true)
    setNotification(null)
    analytics.trackFunnelStep('analyze_button_click', { taskType, wordCount: words })
    
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {"Content-Type": "application/json"}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const res = await apiConfig.fetch("api/essays/analyze", {
        method: "POST", 
        headers, 
        body: JSON.stringify({ text, taskType })
      })
      const data = await res.json()
      
      if (res.ok) {
        analytics.trackEssayAnalyze(taskType, words, data.overall)
        analytics.trackFunnelStep('analysis_success', { 
          bandScore: data.overall, 
          cefr: data.cefr 
        })
        
        // Trigger feedback after successful analysis
        triggerOnFeatureUse()
        
        nav(`/result/${data.publicId || "local"}`, { state: data })
      } else if (res.status === 429) {
        analytics.trackFunnelStep('rate_limit_hit', { 
          userType: data.userType,
          remaining: data.remaining 
        })
        // Handle rate limiting with friendly notification
        if (data.suggestLogin) {
          setNotification({
            type: 'info',
            message: data.message || "You've used your 3 free analyses. Create an account to get 7 more today!",
            showLoginSuggestion: true
          })
        } else {
          setNotification({
            type: 'warning',
            message: data.message || "Daily rate limit exceeded. Please try again tomorrow."
          })
        }
      } else {
        setNotification({
          type: 'error',
          message: data.error || "Analysis failed"
        })
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: "Network error. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <section className="container py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Analyze Your <span className="bg-gradient-to-r from-brand to-blue-600 bg-clip-text text-transparent">IELTS Essay</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Paste your Task 1 or Task 2 essay and get instant band scores with detailed feedback from our AI examiner.
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-8 p-4 rounded-xl border-l-4 ${
            notification.type === 'info' ? 'bg-blue-50 border-blue-400' :
            notification.type === 'warning' ? 'bg-amber-50 border-amber-400' :
            notification.type === 'error' ? 'bg-red-50 border-red-400' :
            'bg-green-50 border-green-400'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'info' ? 'text-blue-800' :
                  notification.type === 'warning' ? 'text-amber-800' :
                  notification.type === 'error' ? 'text-red-800' :
                  'text-green-800'
                }`}>
                  {notification.message}
                </p>
                {notification.showLoginSuggestion && (
                  <div className="mt-3 flex items-center gap-3">
                    <a 
                      href="/login" 
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Account
                    </a>
                    <span className="text-xs text-blue-600">Get 7 more analyses today!</span>
                  </div>
                )}
              </div>
              <button 
                onClick={dismissNotification}
                className={`ml-4 ${
                  notification.type === 'info' ? 'text-blue-400 hover:text-blue-600' :
                  notification.type === 'warning' ? 'text-amber-400 hover:text-amber-600' :
                  notification.type === 'error' ? 'text-red-400 hover:text-red-600' :
                  'text-green-400 hover:text-green-600'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 lg:p-12">
          {/* Task Type Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Task Type:</span>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button 
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    taskType === "task1" 
                      ? "bg-white text-brand shadow-sm" 
                      : "text-slate-600 hover:text-slate-800"
                  }`} 
                  onClick={() => setTaskType("task1")}
                >
                  Task 1
                </button>
                <button 
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    taskType === "task2" 
                      ? "bg-white text-brand shadow-sm" 
                      : "text-slate-600 hover:text-slate-800"
                  }`} 
                  onClick={() => setTaskType("task2")}
                >
                  Task 2
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-lg font-semibold ${
                isValidLength ? 'text-green-600' : words < 150 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {words} words
              </div>
              <div className="text-sm text-slate-500">
                {words < 150 && "Need at least 150 words"}
                {words > 320 && "Maximum 320 words allowed"}
                {isValidLength && "Perfect length!"}
              </div>
            </div>
          </div>

          {/* Essay Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Your Essay
            </label>
            <div className="relative">
              <textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                className="w-full h-96 p-6 border-2 border-slate-200 rounded-xl resize-none focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none transition-colors" 
                placeholder={`Paste your ${taskType === 'task1' ? 'Task 1' : 'Task 2'} essay here...

${taskType === 'task1' 
  ? 'Task 1 Tips: Describe the main trends, compare data points, and summarize key information from charts, graphs, tables, or diagrams.' 
  : 'Task 2 Tips: Present a clear position on the topic, develop your arguments with examples, and address different perspectives where relevant.'
}`}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  isValidLength ? 'bg-green-500' : 'bg-slate-300'
                }`}></div>
                <span className="text-sm text-slate-500">
                  {isValidLength ? 'Ready to analyze' : 'Check word count'}
                </span>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <div className="text-center mb-8">
            <button 
              onClick={onAnalyze} 
              disabled={loading || !isValidLength} 
              className="group px-10 py-4 rounded-xl bg-gradient-to-r from-brand to-blue-600 text-white text-lg font-semibold hover:from-brand/90 hover:to-blue-600/90 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Your Essay...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  Analyze My Essay
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          </div>

          {/* Requirements Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-brand rounded-full"></div>
                Requirements
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  150-320 words ({isValidLength ? '✓' : '✗'})
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Complete essay structure
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Correct task type selected
                </li>
              </ul>
            </div>
            
            <div className="p-6 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                What You'll Get
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Individual band scores (TA, CC, LR, GRA)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Overall band prediction & CEFR level
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Detailed feedback & improvement tips
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Downloadable PDF report
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
