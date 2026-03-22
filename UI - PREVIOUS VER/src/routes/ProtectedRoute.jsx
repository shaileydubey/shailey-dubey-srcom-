import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading, isUser, isAdmin, isSuperuser, isAgent } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#080a1a',
        color: '#9d7dff', fontFamily: "'Syne',sans-serif", fontSize: 16,
      }}>
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role === 'admin'     && !isAdmin)     return <Navigate to="/login" replace />
  if (role === 'superuser' && !isSuperuser) return <Navigate to="/login" replace />
  if (role === 'agent'     && !isAgent)     return <Navigate to="/login" replace />
  if (role === 'user'      && !isUser)      return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute