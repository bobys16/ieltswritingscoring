import { Outlet, Link } from "react-router-dom"

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <header className="border-b">
        <nav className="container h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold">IELTS Band Estimator</Link>
          <div className="flex gap-4 text-sm">
            <Link to="/analyze">Analyze</Link>
            <Link to="/login">Login</Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="container py-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Bandly — Improve faster.
        </div>
      </footer>
    </div>
  )
}
