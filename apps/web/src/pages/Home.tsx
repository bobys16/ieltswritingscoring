export default function Home() {
  return (
    <section className="container py-16">
      <div className="max-w-2xl">
        <h1 className="text-4xl/tight font-semibold">Estimate your IELTS Writing band in 60 seconds</h1>
        <p className="mt-3 text-slate-600">Paste your Task 1 or Task 2 essay and get TA, CC, LR, GRA scores—with feedback and CEFR level.</p>
        <div className="mt-6 flex items-center gap-3">
          <a href="/analyze" className="px-5 py-3 rounded-md bg-brand text-white font-medium">Get your Band</a>
          <a href="#how" className="px-5 py-3 rounded-md border">How it works</a>
        </div>
      </div>
      <div id="how" className="mt-16 grid md:grid-cols-3 gap-6">
        {["Paste essay","Analyze with AI","Get scores & tips"].map((t,i)=>(
          <div key={i} className="p-6 rounded-xl border">
            <div className="text-sm font-semibold text-brand mb-2">Step {i+1}</div>
            <div className="text-lg font-medium">{t}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
