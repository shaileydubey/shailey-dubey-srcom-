import { Routes, Route, Navigate } from 'react-router-dom'
import GreetAi from '../pages/GreetAi.jsx'
import MainLayout from '../components/layout/MainLayout.jsx'
import Home       from '../pages/Home.jsx'
import Login      from '../pages/Login.jsx'
import Register   from '../pages/Register.jsx'

import ProtectedRoute from './ProtectedRoute.jsx'

import AppShell from '../layout/AppShell.jsx'

import HomePage           from '../pages/user/HomePage.jsx'
import AnalyticsPage      from '../pages/user/AnalyticsPage.jsx'
import SendCallPage       from '../pages/user/SendCallPage.jsx'
import PersonasPage       from '../pages/user/PersonasPage.jsx'
import PathwaysPage       from '../pages/user/PathwaysPage.jsx'
import BatchesPage        from '../pages/user/BatchesPage.jsx'
import ToolsPage          from '../pages/user/ToolsPage.jsx'
import BillingPage        from '../pages/user/BillingPage.jsx'
import VoicesPage         from '../pages/user/VoicesPage.jsx'
import KnowledgeBasesPage from '../pages/user/KnowledgeBasesPage.jsx'
import WebWidgetPage      from '../pages/user/WebWidgetPage.jsx'
import CallLogsPage       from '../pages/user/CallLogsPage.jsx'

import AdminPage            from '../pages/AdminPage.jsx'
import AdminDashboard       from '../pages/admin/Admindashboard.jsx'
import AdminSettings        from '../pages/admin/AdminSettings.jsx'
import AgentPage            from '../pages/AgentPage.jsx'
import AgentDashboard       from '../pages/agent/AgentDashboard.jsx'
import SuperuserPage        from '../pages/SuperuserPage.jsx'
import SuperuserDashboard   from '../pages/superuser/Dashboard.jsx'
import SuperuserAgents      from '../pages/superuser/Agents.jsx'
import SuperuserAgentDetail from '../pages/superuser/AgentDetail.jsx'
import SuperuserAnalytics   from '../pages/superuser/CallAnalytics.jsx'
import SuperuserSettings    from '../pages/superuser/Settings.jsx'
import IVRStudio            from '../pages/superuser/IVRStudio.jsx'
import Escalations          from '../pages/superuser/Escalations.jsx'

const AppRoutes = () => {
  return (
    <Routes>

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/welcome"
        element={
          <ProtectedRoute role="user">
            <GreetAi />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index                  element={<HomePage />} />
        <Route path="analytics"       element={<AnalyticsPage />} />
        <Route path="send-call"       element={<SendCallPage />} />
        <Route path="personas"        element={<PersonasPage />} />
        <Route path="pathways"        element={<PathwaysPage />} />
        <Route path="batches"         element={<BatchesPage />} />
        <Route path="tools"           element={<ToolsPage />} />
        <Route path="billing"         element={<BillingPage />} />
        <Route path="voices"          element={<VoicesPage />} />
        <Route path="knowledge-bases" element={<KnowledgeBasesPage />} />
        <Route path="web-widget"      element={<WebWidgetPage />} />
        <Route path="call-logs"       element={<CallLogsPage />} />
      </Route>

      {/* ── Admin routes — specific before wildcard ── */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute role="admin">
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="admin">
            <AdminPage />
          </ProtectedRoute>
        }
      />

      {/* ── Superuser routes — specific before wildcard ── */}
      <Route
        path="/superuser"
        element={
          <ProtectedRoute role="superuser">
            <SuperuserPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superuser/dashboard"
        element={
          <ProtectedRoute role="superuser">
            <SuperuserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superuser/agents"
        element={
          <ProtectedRoute role="superuser">
            <SuperuserAgents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superuser/agent/:id"
        element={
          <ProtectedRoute role="superuser">
            <SuperuserAgentDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superuser/analytics"
        element={
          <ProtectedRoute role="superuser">
            <SuperuserAnalytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superuser/settings"
        element={
          <ProtectedRoute role="superuser">
            <SuperuserSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superuser/ivr-studio"
        element={
          <ProtectedRoute role="superuser">
            <IVRStudio />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superuser/escalations"
        element={
          <ProtectedRoute role="superuser">
            <Escalations />
          </ProtectedRoute>
        }
      />

      {/* ── Agent routes ── */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute role="agent">
            <AgentPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent/dashboard"
        element={
          <ProtectedRoute role="agent">
            <AgentDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  )
}

export default AppRoutes