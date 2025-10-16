import { useState, useEffect } from 'react'
import analytics from '../utils/analytics'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
    // Track page view
    analytics.trackPageView('/home', {
      source: document.referrer || 'direct',
      userAgent: navigator.userAgent
    })
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233a7afe' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container relative">
          <div className={`max-w-6xl mx-auto pt-20 pb-32 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            {/* Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand text-sm font-medium rounded-full border border-brand/20">
                <div className="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
                🚀 Powered by Advanced AI Technology
              </div>
            </div>

            {/* Main heading */}
            <div className="text-center mb-12">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
                <span className="block">Get Your</span>
                <span className="block bg-gradient-to-r from-brand to-blue-600 bg-clip-text text-transparent">
                  IELTS Writing Band
                </span>
                <span className="block">in 60 Seconds</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Stop guessing your IELTS score. Get <span className="font-semibold text-slate-800">instant, accurate band predictions</span> with detailed feedback from our AI examiner trained on thousands of real IELTS essays.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a 
                href="/analyze" 
                className="group px-8 py-4 bg-brand text-white text-lg font-semibold rounded-2xl hover:bg-brand/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <span className="flex items-center justify-center gap-2">
                  Analyze My Essay Now
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </a>
              <a 
                href="#how" 
                className="px-8 py-4 border-2 border-slate-200 text-slate-700 text-lg font-semibold rounded-2xl hover:border-brand hover:text-brand hover:bg-brand/5 transition-all duration-300"
              >
                See How It Works
              </a>
              {/* Test feedback button */}
              <button
                onClick={() => {
                  // Use global feedback trigger function
                  if ((window as any).triggerFeedback) {
                    (window as any).triggerFeedback()
                  }
                }}
                className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-medium text-sm"
                title="Test Feedback Modal"
              >
                💭 Give Feedback
              </button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 text-slate-600">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Instant Results</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-slate-600">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">100% Free</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-slate-600">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-brand/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-brand to-blue-600 bg-clip-text text-transparent mb-3">
                10,000+
              </div>
              <div className="text-lg text-slate-600 font-medium">Essays Analyzed</div>
              <div className="text-sm text-slate-500 mt-1">Trusted by students worldwide</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-3">
                95%
              </div>
              <div className="text-lg text-slate-600 font-medium">Accuracy Rate</div>
              <div className="text-sm text-slate-500 mt-1">Compared to human examiners</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-3">
                30s
              </div>
              <div className="text-lg text-slate-600 font-medium">Average Analysis</div>
              <div className="text-sm text-slate-500 mt-1">Lightning fast results</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 bg-slate-50">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Our AI examiner evaluates your essay using the same criteria as real IELTS examiners
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-brand to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <div className="text-4xl">📝</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">Paste Your Essay</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Simply copy and paste your IELTS Task 1 or Task 2 essay into our analyzer. 
                <span className="font-semibold text-slate-800"> No registration required.</span>
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <div className="text-4xl">🤖</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">AI Analysis</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Our advanced AI examiner analyzes your essay across all 4 IELTS criteria: 
                <span className="font-semibold text-slate-800"> TA, CC, LR, and GRA.</span>
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <div className="text-4xl">📊</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">Get Detailed Results</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Receive your band scores, CEFR level, detailed feedback, and 
                <span className="font-semibold text-slate-800"> downloadable PDF report</span> instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Why Choose Our AI Examiner?</h2>
            <p className="text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto">
              Get the most accurate and detailed IELTS band prediction available
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="group bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-brand/20 hover:scale-105">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Instant Results</h3>
              <p className="text-slate-600 leading-relaxed">Get your comprehensive band scores in under 60 seconds</p>
            </div>
            
            <div className="group bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-brand/20 hover:scale-105">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Accurate Scoring</h3>
              <p className="text-slate-600 leading-relaxed">95% accuracy rate compared to certified human examiners</p>
            </div>
            
            <div className="group bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-brand/20 hover:scale-105">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">📋</div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">Detailed Feedback</h3>
              <p className="text-slate-600 leading-relaxed">Specific, actionable suggestions for improvement</p>
            </div>
            
            <div className="group bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-brand/20 hover:scale-105">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">📄</div>
              <h3 className="text-xl font-bold mb-3 text-slate-800">PDF Reports</h3>
              <p className="text-slate-600 leading-relaxed">Professional reports you can download and share</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">What Students Say</h2>
            <p className="text-xl text-slate-600">Join thousands who've improved their IELTS scores</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 mb-4 italic">"This AI examiner gave me exactly what I needed - honest feedback and clear areas to improve. Got my target band 7!"</p>
              <div className="font-semibold text-slate-800">Sarah M.</div>
              <div className="text-sm text-slate-500">IELTS Candidate</div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 mb-4 italic">"Incredibly accurate! The AI spotted issues I didn't even notice. Saved me time and money before the real test."</p>
              <div className="font-semibold text-slate-800">Ahmed K.</div>
              <div className="text-sm text-slate-500">Graduate Student</div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 mb-4 italic">"The detailed feedback helped me understand exactly where I was losing marks. Improved from 6.5 to 8.0!"</p>
              <div className="font-semibold text-slate-800">Lisa Chen</div>
              <div className="text-sm text-slate-500">Professional</div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">IELTS Writing Tips & Guides</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Expert advice and strategies to help you achieve your target band score</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
              <div className="p-8">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Band 7 vs Band 8: Key Differences</h3>
                <p className="text-slate-600 mb-4">Understand what separates good writing from great writing</p>
                <a href="/blog/ielts-band-7-vs-8-differences" className="text-brand font-medium hover:text-brand/80 transition-colors">
                  Read More →
                </a>
              </div>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
              <div className="p-8">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Task 1 vs Task 2 Strategies</h3>
                <p className="text-slate-600 mb-4">Different approaches for different essay types</p>
                <a href="/blog/task-1-vs-task-2-strategies" className="text-brand font-medium hover:text-brand/80 transition-colors">
                  Read More →
                </a>
              </div>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
              <div className="p-8">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">How Our AI Analysis Works</h3>
                <p className="text-slate-600 mb-4">Behind the scenes of our scoring algorithm</p>
                <a href="/blog/free-ielts-band-calculator-guide" className="text-brand font-medium hover:text-brand/80 transition-colors">
                  Read More →
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <a 
              href="/blog" 
              className="inline-block px-8 py-4 border-2 border-brand text-brand font-semibold rounded-2xl hover:bg-brand hover:text-white transition-all duration-300"
            >
              View All Tips & Guides
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-brand via-blue-600 to-purple-600 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Know Your Real IELTS Band?
            </h2>
            <p className="text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed">
              Join thousands of IELTS candidates who have improved their scores with our AI-powered feedback and detailed analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/analyze" 
                className="group px-10 py-5 bg-white text-brand text-xl font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
              >
                <span className="flex items-center justify-center gap-3">
                  Start Your Free Analysis Now
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </a>
            </div>
            <div className="mt-8 text-white/80 text-lg">
              ✨ No registration required • 100% Free • Instant results
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
