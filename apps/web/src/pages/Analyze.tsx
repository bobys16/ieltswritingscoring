import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Analyze() {
  const [text, setText] = useState("")
  const [taskType, setTaskType] = useState<"task1"|"task2">("task2")
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const words = text.trim().split(/\s+/).filter(Boolean).length
  const isValidLength = words >= 150 && words <= 320

  async function onAnalyze() {
    if (!isValidLength) { 
      alert("Essay must be 150–320 words.") 
      return 
    }
    
    setLoading(true)
    try {
      const res = await fetch("/api/essays/analyze", {
        method: "POST", 
        headers: {"Content-Type": "application/json"}, 
        body: JSON.stringify({ text, taskType })
      })
      const data = await res.json()
      
      if (res.ok) {
        nav(`/result/${data.publicId || "local"}`, { state: data })
      } else {
        alert(data.error || "Analysis failed")
      }
    } catch (err) {
      alert("Network error. Please try again.")
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
