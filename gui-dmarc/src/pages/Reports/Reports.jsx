import { useState, useEffect } from 'react'
import { getDmarcReportsByDateRange } from '@src/hooks/dmarcReports'
import { DmarcReportsTable } from '../../components/ReportsTables'

function Reports() {
  // Date handling
  const [endDate, setEndDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 31)),
  )
  const [reports, setReports] = useState([])

  useEffect(() => {
    setLoading(true)
    async function fetchReports() {
      const response = await getDmarcReportsByDateRange(startDate, endDate)
      setReports(response.data)
      setLoading(false)
    }
    fetchReports()
  }, [startDate, endDate])
  const handleStartDateChange = (event) => {
    setStartDate(new Date(event.target.value))
  }

  const handleEndDateChange = (event) => {
    setEndDate(new Date(event.target.value))
  }
  const [filters, setFilters] = useState({
    reportId: '',
    orgName: '',
    email: '',
  })

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }))
  }

  const filteredReports = reports.filter((report) => {
    const { report_metadata } = report
    return (
      report_metadata.report_id
        .toLowerCase()
        .includes(filters.reportId.toLowerCase()) &&
      report_metadata.org_name
        .toLowerCase()
        .includes(filters.orgName.toLowerCase()) &&
      report_metadata.email.toLowerCase().includes(filters.email.toLowerCase())
    )
  })

  return (
    <div className="flex flex-col items-center p-5 h-screen">
      <h1 className="text-3xl font-bold">Reports by Date</h1>
      <div className="flex flex-row gap-5 px-3 py-2 rounded-xl bg-gray-700 justify-between my-3">
        <input
          type="date"
          className="bg-gray-800 px-3 py-2 rounded-xl"
          value={startDate.toISOString().split('T')[0]}
          onChange={handleStartDateChange}
        />
        <input
          type="date"
          className="bg-gray-800 px-3 py-2 rounded-xl"
          value={endDate.toISOString().split('T')[0]}
          onChange={handleEndDateChange}
        />
        <input
          type="text"
          name="reportId"
          value={filters.reportId}
          onChange={handleFilterChange}
          placeholder="Report ID"
          className="bg-gray-800 px-3 py-2 rounded-xl"
        />
        <input
          type="text"
          name="orgName"
          value={filters.orgName}
          onChange={handleFilterChange}
          placeholder="Organization Name"
          className="bg-gray-800 px-3 py-2 rounded-xl"
        />
        <input
          type="text"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
          placeholder="Email"
          className="bg-gray-800 px-3 py-2 rounded-xl"
        />
      </div>
      <DmarcReportsTable reportsData={filteredReports} />
    </div>
  )
}

export default Reports
