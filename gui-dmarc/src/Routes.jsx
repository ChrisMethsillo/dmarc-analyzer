import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import ReportData from './pages/Report/Report'
import Dashboard from './pages/Dashboard/Dashboard'
import Layout from './pages/Navbar/Layout'
import Reports from './pages/Reports/Reports'
import Login from './pages/Login/Login'

import { AuthProvider } from '@src/context/AuthContext'
import PrivateRoute from '@src/routes/PrivateRoute'

function MyRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthProvider />}>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/report/:id" element={<ReportData />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default MyRoutes
