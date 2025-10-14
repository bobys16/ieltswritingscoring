export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand/5 via-white to-brand/10">
        <div className="container py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-brand/10 text-brand text-sm font-medium rounded-full mb-6">
              🚀 Powered by Advanced AI Technology
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Get Your <span className="text-brand">IELTS Writing Band</span> in 
              <span className="block text-brand">60 Seconds</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Stop guessing your IELTS score. Get instant, accurate band predictions with detailed feedback 
              from our AI examiner trained on thousands of real IELTS essays.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a 
                href="/analyze" 
                className="px-8 py-4 bg-brand text-white text-lg font-semibold rounded-xl hover:bg-brand/90 transition shadow-lg hover:shadow-xl"
              >
                Analyze My Essay Now →
              </a>
              <a 
                href="#how" 
                className="px-8 py-4 border-2 border-slate-200 text-slate-700 text-lg font-semibold rounded-xl hover:border-brand hover:text-brand transition"
              >
                See How It Works
              </a>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-brand mb-2">10,000+</div>
              <div className="text-slate-600">Essays Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand mb-2">95%</div>
              <div className="text-slate-600">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand mb-2">30 sec</div>
              <div className="text-slate-600">Average Analysis Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our AI examiner evaluates your essay using the same criteria as real IELTS examiners
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="text-2xl">📝</div>
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Paste Your Essay</h3>
              <p className="text-slate-600">
                Simply copy and paste your IELTS Task 1 or Task 2 essay into our analyzer. 
                No registration required.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="text-2xl">🤖</div>
              </div>
              <h3 className="text-xl font-semibold mb-3">2. AI Analysis</h3>
              <p className="text-slate-600">
                Our advanced AI examiner analyzes your essay across all 4 IELTS criteria: 
                TA, CC, LR, and GRA.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="text-2xl">📊</div>
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Get Detailed Results</h3>
              <p className="text-slate-600">
                Receive your band scores, CEFR level, detailed feedback, and downloadable 
                PDF report instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our AI Examiner?</h2>
            <p className="text-xl text-slate-600">Get the most accurate and detailed IELTS band prediction available</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-semibold mb-2">Instant Results</h3>
              <p className="text-sm text-slate-600">Get your band scores in under 60 seconds</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="font-semibold mb-2">Accurate Scoring</h3>
              <p className="text-sm text-slate-600">95% accuracy compared to human examiners</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="font-semibold mb-2">Detailed Feedback</h3>
              <p className="text-sm text-slate-600">Specific suggestions for improvement</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="font-semibold mb-2">PDF Reports</h3>
              <p className="text-sm text-slate-600">Professional reports you can share</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand to-brand/80">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Know Your IELTS Band?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of IELTS candidates who have improved their scores with our AI feedback
            </p>
            <a 
              href="/analyze" 
              className="inline-block px-8 py-4 bg-white text-brand text-lg font-semibold rounded-xl hover:bg-slate-50 transition shadow-lg"
            >
              Start Your Free Analysis Now
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
