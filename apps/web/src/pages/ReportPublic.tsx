import { useParams } from "react-router-dom"

export default function ReportPublic() {
  const { publicId } = useParams()

  return (
    <section className="container py-10 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-3">Shared IELTS Report</h1>
        <p className="text-slate-600">Public report for ID: {publicId}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
        <div className="mb-4">
          <div className="text-5xl font-bold text-brand mb-2">7.0</div>
          <div className="text-lg text-slate-600">Overall Band Score</div>
        </div>
        
        <p className="text-slate-700 mb-6">
          This is a placeholder for the public report view. In the full implementation, 
          this would fetch and display the actual essay analysis results.
        </p>

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
