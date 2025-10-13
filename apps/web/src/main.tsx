import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App"
import "./index.css"

const Home = React.lazy(() => import("./pages/Home"))
const Analyze = React.lazy(() => import("./pages/Analyze"))
const Result = React.lazy(() => import("./pages/Result"))
const Login = React.lazy(() => import("./pages/Login"))
const ReportPublic = React.lazy(() => import("./pages/ReportPublic"))

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <App/>, 
    children: [
      { path: "/", element: <React.Suspense fallback={<div>Loading...</div>}><Home/></React.Suspense> },
      { path: "/analyze", element: <React.Suspense fallback={<div>Loading...</div>}><Analyze/></React.Suspense> },
      { path: "/result/:id", element: <React.Suspense fallback={<div>Loading...</div>}><Result/></React.Suspense> },
      { path: "/r/:publicId", element: <React.Suspense fallback={<div>Loading...</div>}><ReportPublic/></React.Suspense> },
      { path: "/login", element: <React.Suspense fallback={<div>Loading...</div>}><Login/></React.Suspense> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
)
