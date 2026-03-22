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

import AdminPage      from '../pages/AdminPage.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import AgentPage            from '../pages/AgentPage.jsx'
import SuperuserPlaceholder from '../pages/SuperuserPlaceholder.jsx'

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

      {/* ── Admin Dashboard must be BEFORE /admin/* ── */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
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

      <Route
        path="/superuser/*"
        element={
          <ProtectedRoute role="superuser">
            <SuperuserPlaceholder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent"
        element={
          <ProtectedRoute role="agent">
            <AgentPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  )
}

export default AppRoutes