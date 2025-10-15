import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { initializePerformanceOptimizations } from './utils/performance'
import './index.css'

import App from './App.tsx'
import Home from './pages/Home.tsx'
import Analyze from './pages/Analyze.tsx'
import Result from './pages/Result.tsx'
import Login from './pages/Login.tsx'
import Dashboard from './pages/Dashboard.tsx'
import History from './pages/History.tsx'
import Profile from './pages/Profile.tsx'
import ReportPublic from './pages/ReportPublic.tsx'
import Blog from './pages/Blog.tsx'
import BlogPost from './pages/BlogPost.tsx'
import { AuthProvider } from './components/AuthProvider.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "analyze", element: <Analyze /> },
      { path: "result/:id", element: <Result /> },
      { path: "login", element: <Login /> },
      { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "history", element: <ProtectedRoute><History /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "r/:publicId", element: <ReportPublic /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:id", element: <BlogPost /> },
    ]
  }
])

// Initialize performance optimizations
initializePerformanceOptimizations()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
