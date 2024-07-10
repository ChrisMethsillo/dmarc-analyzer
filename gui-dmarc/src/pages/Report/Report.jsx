import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getDmarcReport } from '@src/hooks/dmarcReports'
import { RecordsTable } from '@src/components/ReportsTables'
import AuthResultsChart, {
  DMARCResultsChart,
  PolicyEvaluatedChart,
} from '@src/components/PieCharts'
import ChoroplethMap from '../../components/ChoroplethMap'

function DataCard({ title, children }) {
  return (
    <div className="flex flex-col flex-grow w-fit bg-blue-gray-700 text-white py-4 px-5 items-center justify-center rounded-lg shadow-lg ">
      <h2 className="font-bold text-center mb-2">{title}</h2>
      <div className="text-center">{children}</div>
    </div>
  )
}

function ReportData() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [ipData, setIpData] = useState({})

  useEffect(() => {
    async function fetchReport() {
      setLoading(true)
      try {
        const response = await getDmarcReport(id)
        setReport(response.data)
        console.log(response.data)
        const ipData = {}
        response.data.record.forEach((record) => {
          const ip = record.row.source_ip
          const count = record.row.count
          if (!ip) {
            return
          }
          if (ip in ipData) {
            ipData[ip] += count
          } else {
            ipData[ip] = count
          }
        })
        setIpData(ipData)
        console.log(ipData)
      } catch (error) {
        console.error('Error fetching DMARC report:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!report) {
    return <div>No report data available.</div>
  }

  return (
    <div className="flex flex-col mx-auto w-screen px-20">
      <h1 className="text-2xl pt-3 px-6 font-bold text-center mb-6">
        Report Data: {report.report_metadata.report_id}
      </h1>
      <h2 className="text-2xl font-semibold mb-2">Report Metadata</h2>
      <div className="flex flex-row gap-2 justify-center w-full flex-wrap">
        <DataCard title="Organization Name:">
          {report.report_metadata.org_name}
        </DataCard>
        <DataCard title="Date range:">
          <p>
            Begin:{' '}
            {new Date(
              report.report_metadata.date_range.begin,
            ).toLocaleDateString()}
          </p>
          <p>
            End:{' '}
            {new Date(
              report.report_metadata.date_range.end,
            ).toLocaleDateString()}
          </p>
        </DataCard>
        <DataCard title="Email:">{report.report_metadata.email}</DataCard>
        <DataCard title="Policy published:">
          {report.policy_published && (
            <div className="mt-1 overflow-x-auto">
              <table className="min-w-full bg-blue-gray-700 border">
                <thead>
                  <tr>
                    <th className="px-4 py-1 border">Domain</th>
                    <th className="px-4 py-1 border">ADKIM</th>
                    <th className="px-4 py-1 border">ASPF</th>
                    <th className="px-4 py-1 border">Policy</th>
                    <th className="px-4 py-1 border">Subdomain Policy</th>
                    <th className="px-4 py-1 border">Percentage</th>
                    <th className="px-4 py-1 border">Failure Options</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-1">
                      {report.policy_published.domain}
                    </td>
                    <td className="border px-4 py-1">
                      {report.policy_published.adkim}
                    </td>
                    <td className="border px-4 py-1">
                      {report.policy_published.aspf}
                    </td>
                    <td className="border px-4 py-1">
                      {report.policy_published.p}
                    </td>
                    <td className="border px-4 py-1">
                      {report.policy_published.sp}
                    </td>
                    <td className="border px-4 py-1">
                      {report.policy_published.pct}%
                    </td>
                    <td className="border px-4 py-1">
                      {report.policy_published.fo}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </DataCard>
        <div className="carousel w-full">
          <div id="policy" className="carousel-item w-full flex-col">
            <h2 className="text-2xl font-semibold mb-2">
              Policy Evaluated Results
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <DMARCResultsChart records={report.record} />
              <PolicyEvaluatedChart records={report.record} type="dkim" />
              <PolicyEvaluatedChart records={report.record} type="spf" />
            </div>
          </div>
          <div id="auth" className="carousel-item flex-col w-full">
            <h1 className="text-2xl font-semibold mb-2">
              Authentication Results
            </h1>
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <AuthResultsChart records={report.record} type="dkim" />
              <AuthResultsChart records={report.record} type="spf" />
            </div>
          </div>
        </div>
        <div className="flex justify-between w-full py-1 rounded-xl">
          <a
            href="#policy"
            className="btn btn-md bg-blue-gray-600 text-gray-100"
          >
            Policy Evaluated
          </a>
          <a href="#auth" className="btn btn-md bg-blue-gray-600 text-gray-100">
            Auth results
          </a>
        </div>
        <div className="flex flex-col w-full">
          <h2 className="text-2xl font-semibold mb-2">Records</h2>
          <RecordsTable recordsData={report.record} />
          <h2 className="text-2xl font-semibold my-4 ">
            Geographical Heatmap by IP Addresses
          </h2>
          <ChoroplethMap ipData={ipData} />
        </div>
      </div>
    </div>
  )
}

export default ReportData
