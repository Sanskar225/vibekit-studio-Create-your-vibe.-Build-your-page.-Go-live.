import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import LandingPage   from './pages/LandingPage'
import LoginPage     from './pages/LoginPage'
import SignupPage    from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage    from './pages/EditorPage'
import PublishedPage from './pages/PublishedPage'

function Loader() {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0A0A0F',gap:16}}>
      <div style={{width:36,height:36,borderRadius:'50%',border:'2.5px solid rgba(124,58,237,0.3)',borderTopColor:'#7C3AED',animation:'spin 0.8s linear infinite'}}/>
      <span style={{color:'#A8A5BE',fontFamily:'Satoshi,sans-serif',fontSize:14}}>Loading…</span>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <Loader />
  if (!user)   return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return null
  if (user)    return <Navigate to="/app" replace />
  return children
}

export default function App() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [init])

  return (
    <Routes>
      <Route path="/"          element={<LandingPage />} />
      <Route path="/p/:slug"   element={<PublishedPage />} />
      <Route path="/login"     element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/signup"    element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
      <Route path="/app"       element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/app/pages/:id" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  )
}
