import React, { useState, useEffect } from 'react'
import AuthResultsChart, { DMARCResultsChart } from '@src/components/PieCharts'
import {
  getDmarcReportsByDateRange,
  getIpsByRange,
  getIdentifiersByDate,
} from '@src/hooks/dmarcReports.js'
import { TopDomainTable } from '@src/components/TopTables'
import ChoroplethMap from '@src/components/ChoroplethMap'
import { PolicyEvaluatedChart } from '../../components/PieCharts'
import DMARCBarchart from '../../components/BarCharts'

function Dashboard() {
  const [endDate, setEndDate] = useState(new Date())
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 31)),
  )
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState([])
  const [records, setRecords] = useState([])
  const [ipData, setIpData] = useState(false)
  const [identifiers, setIdentifiers] = useState(false)
  const [activeTable, setActiveTable] = useState('envelopeTo')

  useEffect(() => {
    async function fetchIps() {
      try {
        const ipData = await getIpsByRange(startDate, endDate)
        setIpData(ipData)
      } catch (error) {
        setIpData({})
      }
    }
    fetchIps()
  }, [])

  useEffect(() => {
    setLoading(true)
    async function fetchReports() {
      const response = await getDmarcReportsByDateRange(startDate, endDate)
      setReports(response.data)
      setLoading(false)
    }
    fetchReports()
  }, [startDate, endDate])

  useEffect(() => {
    if (reports.length > 0) {
      const newRecords = []
      reports.forEach((report, index) => {
        report.record.forEach((record, recordIndex) => {
          newRecords.push({
            id: `${index}-${recordIndex}`,
            ...record,
          })
        })
      })
      setRecords(newRecords)
    }
  }, [reports])

  useEffect(() => {
    async function fetchIdentifiers() {
      try {
        const identifiers = await getIdentifiersByDate(startDate, endDate)
        setIdentifiers(identifiers)
      } catch (error) {
        setIdentifiers({})
      }
    }
    fetchIdentifiers()
  }, [startDate, endDate])

  const handleStartDateChange = (event) => {
    setStartDate(new Date(event.target.value))
  }

  const handleEndDateChange = (event) => {
    setEndDate(new Date(event.target.value))
  }

  const handleTableChange = (table) => {
    setActiveTable(table)
  }

  return (
    <div className="flex flex-col px-6 md:px-40 py-6 items-start gap-5 justify-between w-screen">
      <h1 className="font-bold text-4xl">Dashboard</h1>
      <div className="flex rounded-xl shadow-xl px-3 py-2 w-full bg-gray-700 gap-5">
        <div className="flex flex-row items-center gap-5 justify-between">
          <label className="font-bold">Select Date Range:</label>
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
      </div>
      <div className="carousel w-full">
        <div id="policy" className="carousel-item w-full flex-col">
          <h1 className="text-2xl font-semibold mb-2">
            Policy Evaluated Results
          </h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <DMARCResultsChart records={records} />
            <PolicyEvaluatedChart records={records} type="dkim" />
            <PolicyEvaluatedChart records={records} type="spf" />
          </div>
        </div>
        <div id="auth" className="carousel-item flex-col w-full">
          <h1 className="text-2xl font-semibold mb-2">
            Authentication Results
          </h1>
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <AuthResultsChart records={records} type="dkim" />
            <AuthResultsChart records={records} type="spf" />
          </div>
        </div>
      </div>
      <div className="flex justify-between bg-gray-700 w-full px-3 py-2 rounded-xl">
        <a href="#policy" className="btn btn-md text-gray-100">
          Policy Evaluated
        </a>
        <a href="#auth" className="btn btn-md text-gray-100">
          Auth results
        </a>
      </div>

      <div className="flex flex-col md:flex-row w-full gap-5">
        <div className="flex flex-col w-full">
          <h1 className="text-2xl font-semibold mb-2">
            Top Envelope From Domains
          </h1>
          <TopDomainTable domainData={identifiers.envelopeFrom} />
        </div>
        <div className="flex flex-col w-full mb-4">
          <h1 className="text-2xl font-semibold mb-2">
            Top Envelope To Domains
          </h1>
          <TopDomainTable domainData={identifiers.envelopeTo} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row w-full gap-2">
        <div className="flex flex-col w-3/5">
          <h2 className="text-xl font-bold mb-4">
            Results of DMARC Reports by Date
          </h2>
          <DMARCBarchart reports={reports} />
        </div>

        <div className="flex rounded-xl flex-col w-2/5">
          <h1 className="text-2xl font-semibold mb-2">
            Geographical Distribution of Source IPs
          </h1>
          {ipData ? <ChoroplethMap ipData={ipData} /> : 'Loading...'}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
