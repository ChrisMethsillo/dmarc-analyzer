import { useState, useEffect } from 'react'
import { getDmarcReportsByDateRange } from '@src/hooks/dmarcReports'
import AuthResultsChart, { DMARCResultsChart } from '@src/components/PieCharts'
import { DmarcReportsTable } from '../../components/ReportsTables'

function Reports() {
  // Date handling
  const [endDate, setEndDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 31)),
  )

  // Report handling
  const [reports, setReports] = useState([])

  // Fetch reports based on date range
  useEffect(() => {
    setLoading(true)
    async function fetchReports() {
      const response = await getDmarcReportsByDateRange(startDate, endDate)
      setReports(response.data)
      setLoading(false)
    }
    fetchReports()
  }, [startDate, endDate])

  // Handler for date change
  const handleStartDateChange = (event) => {
    setStartDate(new Date(event.target.value))
  }

  const handleEndDateChange = (event) => {
    setEndDate(new Date(event.target.value))
  }

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold">Reports by Date</h1>
      <div className="flex flex-row gap-5 justify-between my-3">
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
      </div>
      <DmarcReportsTable reportsData={reports} />
    </div>
  )
}

export default Reports
