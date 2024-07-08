import React, { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const DMARCBarchart = ({ reports }) => {
  const [chartData, setChartData] = useState(null)
  const processData = () => {
    if (!reports) return
    const dataByDate = {}
    reports.forEach((report) => {
      const dateBegin = new Date(report.report_metadata.date_range.begin)
      const dateKey = `${String(dateBegin.getDate()).padStart(2, '0')}-${String(dateBegin.getMonth() + 1).padStart(2, '0')}-${dateBegin.getFullYear()}`

      if (!dataByDate[dateKey]) {
        dataByDate[dateKey] = { none: 0, quarantine: 0, reject: 0 }
      }

      report.record.forEach((record) => {
        const disposition = record.row.policy_evaluated.disposition
        dataByDate[dateKey][disposition]++
      })
    })

    const labels = Object.keys(dataByDate)
    const datasets = ['none', 'quarantine', 'reject'].map((disposition) => ({
      label: disposition,
      data: labels.map((date) => dataByDate[date][disposition]),
      backgroundColor:
        disposition === 'none'
          ? 'rgba(54, 162, 235, 0.5)'
          : disposition === 'quarantine'
            ? 'rgba(255, 206, 86, 0.5)'
            : 'rgba(255, 99, 132, 0.5)',
    }))

    setChartData({
      labels,
      datasets,
    })
  }

  useEffect(() => {
    processData()
  }, [reports])

  return (
    <div className="flex flex-col w-full items-center h-fit bg-gray-700 text-white p-5 rounded-md shadow-lg">
      {chartData && (
        <Bar
          data={chartData}
          options={{
            plugins: {
              datalabels: {
                color: '#fff',
                font: {
                  weight: 'bold',
                },
              },
            },
            color: '#fff',
            scales: {
              x: {
                stacked: true,
              },
              y: {
                stacked: true,
              },
            },
            responsive: true,
            maintainAspectRatio: true,
          }}
        />
      )}
    </div>
  )
}

export default DMARCBarchart
