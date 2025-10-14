import { useLocation, useParams } from "react-router-dom"

export default function Result() {
  const { state } = useLocation() as any
  const { id } = useParams()
  const data = state || {}
  const bands = data.bands || { ta: 7, cc: 6.5, lr: 7, gra: 7 }

  async function downloadPDF() {
    try {
      const res = await fetch(`/api/reports/${data.publicId || id}/pdf`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `ielts-report-${data.publicId || id}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        alert("PDF download not available")
      }
    } catch (err) {
      alert("Download failed")
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    } catch (err) {
      alert("Could not copy link")
    }
  }

  return (
    <section className="container py-10 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold mb-3">Your IELTS Band Analysis</h1>
        <p className="text-slate-600">Here's your detailed band breakdown and feedback</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Overall Score & Band Breakdown */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-center mb-6">
            <div className="text-sm text-slate-500 mb-2">Overall Band Score</div>
            <div className="text-6xl font-bold text-brand mb-2">
              {data.overall?.toFixed(1) ?? "7.0"}
            </div>
            <div className="text-lg text-slate-600">
              CEFR Level: <span className="font-semibold text-brand">{data.cefr || "B2"}</span>
            </div>
          </div>

          {/* Individual Bands */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Task Achievement</div>
              <div className="text-2xl font-semibold text-slate-900">{bands.ta}</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Coherence & Cohesion</div>
              <div className="text-2xl font-semibold text-slate-900">{bands.cc}</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Lexical Resource</div>
              <div className="text-2xl font-semibold text-slate-900">{bands.lr}</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Grammar Range & Accuracy</div>
              <div className="text-2xl font-semibold text-slate-900">{bands.gra}</div>
            </div>
          </div>
        </div>

        {/* Feedback & Actions */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Detailed Feedback</h2>
          <div className="prose prose-sm text-slate-700 leading-relaxed mb-6">
            {data.feedback || "Improve coherence with clear transitions and consistent paragraphing. Vary complex sentences and reduce minor grammatical slips."}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={downloadPDF} 
              className="w-full px-4 py-3 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 transition"
            >
              Download PDF Report
            </button>
            <button 
              onClick={copyLink} 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:border-brand hover:text-brand transition"
            >
              Copy Share Link
            </button>
            <a 
              href="/analyze" 
              className="block w-full px-4 py-3 rounded-lg bg-slate-100 text-slate-700 font-medium text-center hover:bg-slate-200 transition"
            >
              Analyze Another Essay
            </a>
          </div>
        </div>
      </div>

      {/* Band Descriptors */}
      <div className="mt-12 bg-slate-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Understanding Your Scores</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Task Achievement (TA):</strong> How well you answered the question and completed the task requirements.
          </div>
          <div>
            <strong>Coherence & Cohesion (CC):</strong> How well your ideas flow and connect throughout the essay.
          </div>
          <div>
            <strong>Lexical Resource (LR):</strong> Range and accuracy of your vocabulary usage.
          </div>
          <div>
            <strong>Grammar Range & Accuracy (GRA):</strong> Variety and correctness of grammatical structures.
          </div>
        </div>
      </div>
    </section>
  )
}
