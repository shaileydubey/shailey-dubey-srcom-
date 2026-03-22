import { NavLink } from 'react-router-dom'

const NAV = [
  { id: 'home',           label: 'Home',                    icon: '⌂', to: '/user' },
  { id: 'analytics',      label: 'Analytics',               icon: '◈', to: '/user/analytics' },
  { id: 'personas',       label: 'Personas',                icon: '◉', to: '/user/personas' },
  { id: 'callLogs',       label: 'Call Logs',               icon: '≡', to: '/user/call-logs' },
  { id: 'sendCall',       label: 'Send Call',               icon: '↗', to: '/user/send-call' },
  { id: 'pathways',       label: 'Conversational Pathways', icon: '⧖', to: '/user/pathways' },
  { id: 'batches',        label: 'Batches',                 icon: '⬡', to: '/user/batches' },
  { id: 'tools',          label: 'Tools',                   icon: '⚙', badge: 'updated', to: '/user/tools' },
  { id: 'automations',    label: 'Automations',             icon: '⟳', badge: 'new',     to: '/user/automations' },
  { id: 'billing',        label: 'Billing & Credits',       icon: '◎', to: '/user/billing' },
  { id: 'phoneNumbers',   label: 'Phone Numbers',           icon: '☎', to: '/user/phone-numbers' },
  { id: 'voices',         label: 'Voices',                  icon: '◑', to: '/user/voices' },
  { id: 'knowledgeBases', label: 'Knowledge Bases',         icon: '◧', to: '/user/knowledge-bases' },
  { id: 'webWidget',      label: 'Web Widget',              icon: '⬕', to: '/user/web-widget' },
  { id: 'sms',            label: 'SMS',                     icon: '✉', to: '/user/sms' },
  { id: 'compliance',     label: 'Compliance & Policy',     icon: '⚖', to: '/user/compliance' },
  { id: 'addOns',         label: 'Add Ons',                 icon: '⊞', to: '/user/add-ons' },
  { id: 'documentation',  label: 'Documentation',           icon: '⊡', to: '/user/documentation' },
]

const IMPL = [
  'home', 'analytics', 'callLogs', 'sendCall', 'pathways',
  'batches', 'tools', 'billing', 'voices', 'personas',
  'knowledgeBases', 'webWidget',
]

export default function Sidebar({ user, onLogout }) {
  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0,
      height: '100vh', width: 250,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--bdr)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100, overflowY: 'auto',
    }}>

      <div style={{ padding: '22px 18px 17px', borderBottom: '1px solid var(--bdr)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg,var(--pur),var(--acc))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 900, color: '#fff', flexShrink: 0,
          }}>SR</div>
          <span style={{ fontSize: 15, lineHeight: 1.15, color: 'var(--txt)' }}>
            SR<br />Comsoft Ai
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((n) => {
          const impl = IMPL.includes(n.id)
          return (
            <NavLink
              key={n.id}
              to={n.to}
              end={n.id === 'home'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                border: `1px solid ${isActive ? 'var(--bdr2)' : 'transparent'}`,
                background: isActive ? 'var(--purl)' : 'transparent',
                color: isActive ? 'var(--pur2)' : 'var(--txt2)',
                fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 500,
                cursor: impl ? 'pointer' : 'default',
                borderRadius: 9, opacity: impl ? 1 : 0.38,
                transition: 'all 0.18s', textAlign: 'left', width: '100%',
                pointerEvents: impl ? 'auto' : 'none',
                textDecoration: 'none',
              })}
              onMouseEnter={(e) => {
                if (impl && !e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'var(--purl)'
                  e.currentTarget.style.color = 'var(--txt)'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = impl ? 'var(--txt2)' : 'var(--txt2)'
                }
              }}
            >
              <span style={{ width: 18, textAlign: 'center', fontSize: 15, flexShrink: 0 }}>{n.icon}</span>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {n.label}
              </span>
              {n.badge === 'new' && (
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                  padding: '2px 7px', borderRadius: 4, background: 'rgba(255,107,53,0.14)',
                  color: 'var(--org)', border: '1px solid rgba(255,107,53,0.25)', flexShrink: 0 }}>New</span>
              )}
              {n.badge === 'updated' && (
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  padding: '2px 7px', borderRadius: 4, background: 'rgba(0,212,160,0.1)',
                  color: 'var(--grn)', border: '1px solid rgba(0,212,160,0.2)', flexShrink: 0 }}>Updated</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div style={{ padding: '14px 12px', borderTop: '1px solid var(--bdr)' }}>
        {user && (
          <div style={{
            marginBottom: 10, padding: '8px 10px', borderRadius: 8,
            background: 'var(--purl)', border: '1px solid var(--bdr2)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--txt2)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 8,
            border: '1px solid var(--bdr2)', background: 'transparent',
            color: 'var(--txt2)', fontFamily: "'Syne',sans-serif",
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            textAlign: 'left', display: 'flex', alignItems: 'center',
            gap: 8, transition: 'all 0.18s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,71,87,0.1)'
            e.currentTarget.style.color = 'var(--red)'
            e.currentTarget.style.borderColor = 'rgba(255,71,87,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--txt2)'
            e.currentTarget.style.borderColor = 'var(--bdr2)'
          }}
        >
          <span style={{ fontSize: 14 }}>⎋</span> Sign out
        </button>
      </div>
    </aside>
  )
}