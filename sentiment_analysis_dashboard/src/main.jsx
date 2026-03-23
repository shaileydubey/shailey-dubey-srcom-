// ─── START: App Entry Point ───────────────────────────────────────────────────
// File   : main.jsx
// Role   : ReactDOM root mount, global CSS injection
// Flow   : index.html → main.jsx → App.jsx → Dashboard tree
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'

import './index.css'       // global styles + CSS variables
import App from './App'    // root component

// Mount React app onto #root div
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// ─── END: App Entry Point ─────────────────────────────────────────────────────
