// ─── START: App Root ──────────────────────────────────────────────────────────
// File      : App.jsx
// Role      : Root component — wires useFileLoader hook into Dashboard
// Hook      : useFileLoader — owns files[], active, handleFiles, removeFile
// Children  : Dashboard
// ─────────────────────────────────────────────────────────────────────────────

import useFileLoader from './hooks/useFileLoader'
import Dashboard     from './components/Dashboard'

// ── App ───────────────────────────────────────────────────────────────────
// fn    : App
// does  : consumes useFileLoader hook, passes state + handlers to Dashboard
export default function App() {

  // all file state + actions encapsulated in hook
  const { files, active, setActive, handleFiles, removeFile } = useFileLoader()

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--brand-bg)' }}>
      <Dashboard
        files={files}
        active={active}
        onSetActive={setActive}
        onAddFiles={handleFiles}
        onRemoveFile={removeFile}
      />
    </div>
  )
}

// ─── END: App Root ────────────────────────────────────────────────────────────
