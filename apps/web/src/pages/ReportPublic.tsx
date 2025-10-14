import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export default function ReportPublic() {
  const { publicId } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${publicId}`)
        if (res.ok) {
          const reportData = await res.json()
          setData(reportData)
        } else {
          setError("Report not found")
        }
      } catch (err) {
        setError("Failed to load report")
      } finally {
        setLoading(false)
      }
    }

    if (publicId) {
      fetchReport()
    }
  }, [publicId])

  if (loading) {
    return (
      <section className="container py-10 max-w-4xl">
        <div className="text-center">
          <div className="text-xl">Loading report...</div>
        </div>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="container py-10 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-3">Report Not Found</h1>
          <p className="text-slate-600 mb-6">{error || "This report does not exist or has been removed."}</p>
          <a 
            href="/analyze" 
            className="inline-block px-6 py-3 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 transition"
          >
            Analyze Your Essay
          </a>
        </div>
      </section>
    )
  }

  const bands = data.bands || { ta: 7, cc: 6.5, lr: 7, gra: 7 }

  return (
    <section className="container py-10 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-3">Shared IELTS Report</h1>
        <p className="text-slate-600">Report ID: {publicId}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Overall Score */}
        <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
          <div className="mb-4">
            <div className="text-5xl font-bold text-brand mb-2">{data.overall?.toFixed(1) || "7.0"}</div>
            <div className="text-lg text-slate-600">Overall Band Score</div>
            <div className="text-sm text-slate-500 mt-1">
              CEFR Level: <span className="font-semibold text-brand">{data.cefr || "B2"}</span>
            </div>
          </div>

          {/* Individual Bands */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-xs text-slate-500">TA</div>
              <div className="text-lg font-semibold">{bands.ta}</div>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-xs text-slate-500">CC</div>
              <div className="text-lg font-semibold">{bands.cc}</div>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-xs text-slate-500">LR</div>
              <div className="text-lg font-semibold">{bands.lr}</div>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <div className="text-xs text-slate-500">GRA</div>
              <div className="text-lg font-semibold">{bands.gra}</div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Feedback</h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            {data.feedback || "No feedback available"}
          </p>
          
          <div className="text-sm text-slate-500 mb-4">
            Task Type: {data.taskType || "task2"} | 
            Generated: {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : ""}
          </div>

          <a 
            href="/analyze" 
            className="block w-full px-4 py-3 rounded-lg bg-brand text-white font-medium text-center hover:bg-brand/90 transition"
          >
            Analyze Your Essay
          </a>
        </div>
      </div>
    </section>
  )
}
