import { useLocation, useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import analytics from '../utils/analytics'

export default function Result() {
  const { state } = useLocation() as any
  const { id } = useParams()
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [copyingLink, setCopyingLink] = useState(false)
  
  const data = state || {}
  const bands = data.bands || { ta: 7, cc: 6.5, lr: 7, gra: 7 }
  const overall = data.overall || 7.0
  const cefr = data.cefr || "B2"
  const feedback = data.feedback || "Work on coherence with clear transitions and consistent paragraphing. Vary complex sentences and reduce minor grammatical slips."

  useEffect(() => {
    analytics.trackPageView('/result', {
      bandScore: overall,
      cefr: cefr,
      reportId: data.publicId || id
    })
    analytics.trackFunnelStep('result_page_view', {
      bandScore: overall,
      cefr: cefr
    })
  }, [overall, cefr, data.publicId, id])

  // Prepare chart data
  const chartData = [
    { category: "TA", score: bands.ta, fullMark: 9 },
    { category: "CC", score: bands.cc, fullMark: 9 },
    { category: "LR", score: bands.lr, fullMark: 9 },
    { category: "GRA", score: bands.gra, fullMark: 9 },
  ]

  const getBandColor = (band: number) => {
    if (band >= 8) return "text-green-600"
    if (band >= 7) return "text-blue-600"
    if (band >= 6) return "text-yellow-600"
    if (band >= 5) return "text-orange-600"
    return "text-red-600"
  }

  const getBandDescription = (band: number) => {
    if (band >= 8.5) return "Excellent"
    if (band >= 7.5) return "Very Good"
    if (band >= 6.5) return "Good"
    if (band >= 5.5) return "Competent"
    if (band >= 4.5) return "Modest"
    return "Limited"
  }

  const getCEFRDescription = (level: string) => {
    const descriptions = {
      "C2": "Mastery - Near-native proficiency",
      "C1": "Advanced - Effective operational proficiency", 
      "B2": "Upper-Intermediate - Vantage level",
      "B1": "Intermediate - Threshold level",
      "A2": "Pre-Intermediate - Waystage level",
      "A1": "Beginner - Breakthrough level"
    }
    return descriptions[level as keyof typeof descriptions] || "Upper-Intermediate - Vantage level"
  }

  async function downloadPDF() {
    if (!data.publicId && !id) return
    
    setDownloadingPDF(true)
    analytics.trackFunnelStep('pdf_download_start', {
      bandScore: overall,
      reportId: data.publicId || id
    })
    
    try {
      const response = await fetch(`/api/reports/${data.publicId || id}/pdf`)
      if (!response.ok) throw new Error('Failed to generate PDF')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `ielts-band-report-${data.publicId || id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      analytics.trackPdfDownload(data.publicId || id || 'unknown', overall)
      analytics.trackFunnelStep('pdf_download_success', {
        bandScore: overall,
        reportId: data.publicId || id
      })
    } catch (error) {
      analytics.trackFunnelStep('pdf_download_error', {
        bandScore: overall,
        reportId: data.publicId || id
      })
      alert('Failed to download PDF. Please try again.')
    } finally {
      setDownloadingPDF(false)
    }
  }

  async function copyShareLink() {
    setCopyingLink(true)
    try {
      await navigator.clipboard.writeText(window.location.href)
      setTimeout(() => setCopyingLink(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = window.location.href
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setTimeout(() => setCopyingLink(false), 2000)
    }
  }

  function shareToSocial(platform: 'twitter' | 'facebook' | 'linkedin') {
    analytics.trackShare(platform, data.publicId || id || 'unknown', overall)
    analytics.trackFunnelStep('social_share', {
      platform,
      bandScore: overall,
      reportId: data.publicId || id
    })
    
    const shareText = `I got Band ${overall.toFixed(1)} (${data.cefr}) on my IELTS Writing! 🎉 Check out my analysis:`
    const shareUrl = window.location.href
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=IELTS,Writing,BandScore`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    }
    
    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <section className="container py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Your <span className="bg-gradient-to-r from-brand to-blue-600 bg-clip-text text-transparent">IELTS Band</span> Result
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Based on official IELTS Writing assessment criteria with 95% accuracy
          </p>
          <div className="mt-4 text-sm text-slate-500">
            {data.createdAt && `Analyzed on ${new Date(data.createdAt).toLocaleDateString()}`}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Overall Score & Band Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            {/* Overall Score Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-brand to-blue-600 rounded-full mb-6 shadow-lg">
                <span 
                  className="text-4xl font-bold text-white" 
                  aria-label={`Overall band score ${overall.toFixed(1)} out of 9`}
                >
                  {overall.toFixed(1)}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Overall Band Score
              </h2>
              <p className={`text-lg font-semibold ${getBandColor(overall)}`}>
                {getBandDescription(overall)}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                <span className="text-sm font-medium text-slate-700">CEFR Level:</span>
                <span className="font-bold text-brand">{cefr}</span>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {getCEFRDescription(cefr)}
              </p>
            </div>

            {/* Individual Band Scores */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Band Breakdown</h3>
              {[
                { label: "Task Achievement", key: "ta", value: bands.ta, description: "How well you answered the question and completed the task requirements" },
                { label: "Coherence & Cohesion", key: "cc", value: bands.cc, description: "How well your ideas flow and connect throughout the essay" },
                { label: "Lexical Resource", key: "lr", value: bands.lr, description: "Range and accuracy of your vocabulary usage" },
                { label: "Grammar & Accuracy", key: "gra", value: bands.gra, description: "Variety and correctness of grammatical structures" },
              ].map(({ label, key, value, description }) => (
                <div key={key} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{label}</h4>
                    <span 
                      className={`font-bold text-xl ${getBandColor(value)}`}
                      aria-label={`${label} score: ${value.toFixed(1)} out of 9`}
                    >
                      {value.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1" role="img" aria-label={`Visual representation of score ${value.toFixed(1)} out of 9`}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i <= value ? 'bg-brand' : 'bg-slate-200'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className={`text-sm font-medium ${getBandColor(value)}`}>
                      {getBandDescription(value)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Chart & Feedback */}
          <div className="space-y-8">
            {/* Radar Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">
                Performance Radar
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="category" 
                      tick={{ fill: '#64748b', fontSize: 14, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis 
                      domain={[0, 9]} 
                      angle={90}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Radar
                      name="Band Score"
                      dataKey="score"
                      stroke="#3a7afe"
                      fill="#3a7afe"
                      fillOpacity={0.2}
                      strokeWidth={3}
                      dot={{ r: 6, fill: '#3a7afe' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-slate-600 text-center mt-4">
                Visual representation of your performance across all four IELTS criteria
              </p>
            </div>

            {/* Feedback Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Detailed Feedback
              </h3>
              <div className="prose prose-slate max-w-none">
                <p 
                  className="text-slate-700 leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ __html: feedback }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={downloadPDF}
            disabled={downloadingPDF || (!data.publicId && !id)}
            className="flex items-center gap-3 px-8 py-4 bg-brand text-white font-semibold rounded-xl hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2"
            aria-label="Download detailed PDF report"
          >
            {downloadingPDF ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF Report
              </>
            )}
          </button>

          <button
            onClick={copyShareLink}
            className="flex items-center gap-3 px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-brand hover:text-brand transition-all focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2"
            aria-label="Copy shareable link to clipboard"
          >
            {copyingLink ? (
              <>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Link Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Share Link
              </>
            )}
          </button>

          <button
            onClick={() => shareToSocial('twitter')}
            className="flex items-center gap-3 px-8 py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2"
            aria-label="Share results on Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Share Results
          </button>

          <Link
            to="/analyze"
            className="flex items-center gap-3 px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-brand hover:text-brand transition-all focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Analyze Another Essay
          </Link>
        </div>

        {/* Next Steps Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">
            Ready to Improve Your IELTS Score?
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Practice More</h4>
              <p className="text-slate-600 text-sm">Analyze multiple essays to track your improvement over time.</p>
            </div>
            
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Study Resources</h4>
              <p className="text-slate-600 text-sm">Access model answers and practice materials for your target band.</p>
            </div>
            
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Track Progress</h4>
              <p className="text-slate-600 text-sm">Create an account to save your results and monitor improvement.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
