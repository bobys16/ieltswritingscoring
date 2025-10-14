import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Analyze() {
  const [text, setText] = useState("")
  const [taskType, setTaskType] = useState<"task1"|"task2">("task2")
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const words = text.trim().split(/\s+/).filter(Boolean).length

  async function onAnalyze() {
    if (words < 150 || words > 320) { 
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
    <section className="container py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-3">Analyze Your IELTS Essay</h1>
        <p className="text-slate-600">Paste your Task 1 or Task 2 essay and get instant band scores with detailed feedback.</p>
      </div>

      {/* Task Type Selection */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          className={`px-4 py-2 rounded-lg border font-medium transition ${
            taskType === "task1" 
              ? "bg-brand text-white border-brand" 
              : "bg-white text-slate-700 border-slate-200 hover:border-brand"
          }`} 
          onClick={() => setTaskType("task1")}
        >
          Task 1
        </button>
        <button 
          className={`px-4 py-2 rounded-lg border font-medium transition ${
            taskType === "task2" 
              ? "bg-brand text-white border-brand" 
              : "bg-white text-slate-700 border-slate-200 hover:border-brand"
          }`} 
          onClick={() => setTaskType("task2")}
        >
          Task 2
        </button>
        <span className="text-sm text-slate-500 ml-auto">
          {words} words {words < 150 && "(minimum 150)"} {words > 320 && "(maximum 320)"}
        </span>
      </div>

      {/* Essay Input */}
      <div className="mb-6">
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          className="w-full h-80 p-4 border border-slate-200 rounded-xl resize-none focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none" 
          placeholder="Paste your essay here...

For Task 1: Describe the information shown in the chart, graph, table or diagram.
For Task 2: Present a clear position on the given topic with supporting arguments."
        />
      </div>

      {/* Analyze Button */}
      <div className="flex justify-center">
        <button 
          onClick={onAnalyze} 
          disabled={loading || words < 150 || words > 320} 
          className="px-8 py-3 rounded-xl bg-brand text-white font-medium hover:bg-brand/90 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
        >
          {loading ? "Analyzing..." : "Analyze Essay"}
        </button>
      </div>

      {/* Requirements */}
      <div className="mt-8 p-4 bg-slate-50 rounded-xl">
        <h3 className="font-medium mb-2">Requirements:</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Essay must be between 150-320 words</li>
          <li>• Choose the correct task type (Task 1 or Task 2)</li>
          <li>• Make sure your essay is complete and ready for evaluation</li>
        </ul>
      </div>
    </section>
  )
}
