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
          
          // Update page meta tags dynamically
          updateMetaTags(reportData, publicId!)
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

  // Function to update meta tags for social sharing
  function updateMetaTags(reportData: any, publicId: string) {
    const title = `IELTS Band ${reportData.overall} - ${reportData.cefr} Level`
    const description = `Check out this IELTS Writing analysis: Band ${reportData.overall} (${reportData.cefr}). Get your free essay analysis at IELTS Band Estimator.`
    const ogImageUrl = `${window.location.origin}/api/reports/${publicId}/og-image`
    const shareUrl = window.location.href

    // Update document title
    document.title = title

    // Update or create meta tags
    updateMetaTag('description', description)
    updateMetaTag('og:title', title)
    updateMetaTag('og:description', description)
    updateMetaTag('og:image', ogImageUrl)
    updateMetaTag('og:url', shareUrl)
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', ogImageUrl)
  }

  function updateMetaTag(property: string, content: string) {
    let selector = `meta[property="${property}"]`
    if (!property.startsWith('og:') && !property.startsWith('twitter:')) {
      selector = `meta[name="${property}"]`
    }
    
    let metaTag = document.querySelector(selector) as HTMLMetaElement
    if (!metaTag) {
      metaTag = document.createElement('meta')
      if (property.startsWith('og:') || property.startsWith('twitter:')) {
        metaTag.setAttribute('property', property)
      } else {
        metaTag.setAttribute('name', property)
      }
      document.head.appendChild(metaTag)
    }
    metaTag.content = content
  }

  function shareReport(platform: 'twitter' | 'facebook' | 'linkedin' | 'copy') {
    const title = `I got Band ${data.overall} (${data.cefr}) on my IELTS Writing! 🎉`
    const url = window.location.href

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&hashtags=IELTS,Writing,BandScore`, '_blank')
        break
      case 'facebook':
        window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!')
        })
        break
    }
  }

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

      {/* Social Sharing Section */}
      <div className="mt-12 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-semibold mb-3 text-slate-800">Share Your Results! 🎉</h3>
        <p className="text-slate-600 mb-6">Let others know about your IELTS success and help them improve too!</p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button
            onClick={() => shareReport('twitter')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </button>
          
          <button
            onClick={() => shareReport('facebook')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
          
          <button
            onClick={() => shareReport('linkedin')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>
          
          <button
            onClick={() => shareReport('copy')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            Copy Link
          </button>
        </div>
        
        <div className="text-sm text-slate-500">
          Help others discover IELTS Band Estimator • 100% Free Analysis
        </div>
      </div>
    </section>
  )
}
