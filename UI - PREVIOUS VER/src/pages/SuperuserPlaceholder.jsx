import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function SuperuserPlaceholder() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100vh', background:'#080a1a', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:24, fontFamily:"'Syne',sans-serif", color:'#e6e1ff' }}>
      <div style={{ width:64, height:64, borderRadius:16, background:'linear-gradient(135deg,#7c5cff,#c084fc)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>◈</div>
      <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>Superuser Dashboard</h1>
      <p style={{ color:'#8e8ab0', margin:0, textAlign:'center', maxWidth:360 }}>
        Welcome, {user?.name}. The superuser panel is under construction and will be available soon.
      </p>
      <button onClick={() => { logout(); navigate('/login') }}
        style={{ padding:'10px 24px', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'#8e8ab0', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontSize:14 }}>
        Sign out
      </button>
    </div>
  )
}