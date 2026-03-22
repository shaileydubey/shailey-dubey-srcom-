import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import GlobalStyles from '../components/dashboard/GlobalStyles.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <GlobalStyles />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar user={user} onLogout={handleLogout} />
        <main style={{ marginLeft: 250, flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </>
  )
}