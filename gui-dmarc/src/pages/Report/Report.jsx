import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getDmarcReport } from '@src/hooks/dmarcReports'
import { RecordsTable } from '@src/components/ReportsTables'
import AuthResultsChart from '../../components/PieCharts'

function DataCard({ title, children }) {
  return (
    <div className="flex flex-col bg-gray-800 text-white py-4 px-5 items-center justify-center rounded-lg">
      <h2 className="font-bold">{title}</h2>
      {children}
    </div>
  )
}

function ReportData() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState({})

  useEffect(() => {
    setLoading(true)
    async function fetchReport() {
      const response = await getDmarcReport(id)
      setReport(response.data)
      setLoading(false)
    }
    fetchReport()
  }, [id])

  return loading ? (
    <div>Loading...</div>
  ) : (
    <div className="flex-col mx-auto">
      <h1 className="text-2xl p-3 font-bold">Report: {report.report_id}</h1>
      <div className="flex flex-row gap-5 items-start w-screen p-6">
        <div className="flex flex-col gap-5 w-1/5">
          <h2 className="text-xl font-bold">Report metadata:</h2>
          <DataCard title="Domain:"> {report.org_name} </DataCard>
          <DataCard title="Date range:">
            <p>Begin: {new Date(report.date_begin).toLocaleDateString()} </p>
            <p>End: {new Date(report.date_end).toLocaleDateString()} </p>
          </DataCard>
          <DataCard title="Email:">{report.email}</DataCard>
          <DataCard title="Policy published:">
            {report.policy_published && (
              <div className="flex gap-3 mt-1">
                <table className="flex-row divide-y border bg-gray-700">
                  <thead className="">
                    <tr>
                      <th
                        className="px-4 py-2 border"
                        title="The domain for which the policy is being published"
                      >
                        Domain
                      </th>
                      <td className="border px-4 py-2">
                        {report.policy_published.domain}
                      </td>
                    </tr>
                    <tr>
                      <th
                        className="px-4 py-2 border"
                        title="Alignment Mode for DKIM"
                      >
                        ADKIM
                      </th>
                      <td className="border px-4 py-2">
                        {report.policy_published.adkim}
                      </td>
                    </tr>
                    <tr>
                      <th
                        className="px-4 py-2 border"
                        title="Alignment Mode for SPF"
                      >
                        ASPF
                      </th>
                      <td className="border px-4 py-2">
                        {report.policy_published.aspf}
                      </td>
                    </tr>
                    <tr>
                      <th
                        className="px-4 py-2 border"
                        title="Policy for Organizational Domains"
                      >
                        Policy
                      </th>
                      <td className="border px-4 py-2">
                        {report.policy_published.p}
                      </td>
                    </tr>
                    <tr>
                      <th
                        className="px-4 py-2 border"
                        title="Policy for Subdomains"
                      >
                        Subdomain Policy
                      </th>
                      <td className="border px-4 py-2">
                        {report.policy_published.sp}
                      </td>
                    </tr>
                    <tr>
                      <th
                        className="px-4 py-2 border"
                        title="Percentage of messages subjected to filtering"
                      >
                        Percentage
                      </th>
                      <td className="border px-4 py-2">
                        {report.policy_published.pct}
                      </td>
                    </tr>
                    <tr>
                      <th
                        className="px-4 py-2 border"
                        title="Failure reporting options"
                      >
                        Failure Options
                      </th>
                      <td className="border px-4 py-2">
                        {report.policy_published.fo}
                      </td>
                    </tr>
                  </thead>
                </table>
              </div>
            )}
          </DataCard>
        </div>

        <div className="flex flex-col gap-6 w-4/5">
          <h2 className="text-xl font-bold">Auth results:</h2>
          <div className="flex flex-row gap-6">
            <AuthResultsChart type="spf" records={report.record} />
            <AuthResultsChart type="dkim" records={report.record} />
          </div>
          <h2 className="text-xl font-bold">Records:</h2>
          <RecordsTable recordsData={report.record} />
        </div>
      </div>
    </div>
  )
}

export default ReportData
