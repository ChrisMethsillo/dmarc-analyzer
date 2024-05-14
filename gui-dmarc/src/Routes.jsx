import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Reports/Home'
import ReportsByDate from './pages/Reports/ReportsByDate'
import ReportData from './pages/Report/Report'

function MyRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Reports" element={<ReportsByDate />} />
        <Route path="/Report/:id" element={<ReportData />} />
      </Routes>
    </Router>
  )
}

export default MyRoutes
