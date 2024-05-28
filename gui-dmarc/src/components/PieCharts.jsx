import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

function AuthResultsChart({ records, type = 'dkim' }) {
  const resultLabels = records.reduce(
    (labels, record) => {
      const result =
        record.auth_results && record.auth_results[type]
          ? record.auth_results[type].result
          : null
      if (result && !labels.includes(result)) {
        labels.push(result)
      }
      return labels
    },
    ['none', 'fail', 'pass'],
  )

  const data = {
    labels: resultLabels,
    datasets: [
      {
        data: records.reduce(
          (acc, record) => {
            const result =
              record.auth_results && record.auth_results[type]
                ? record.auth_results[type].result
                : null
            if (result) {
              acc[resultLabels.indexOf(result)]++
            } else {
              acc[0]++
            }
            return acc
          },
          Array(resultLabels.length + 1).fill(0),
        ),

        backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 205, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="flex flex-col w-full items-center h-fit bg-gray-700 text-white p-5 rounded-md shadow-lg">
      <h2 className="text-xl font-bold">
        Total Auth Results {type.toUpperCase()}
      </h2>
      <div className="flex-grow">
        <Pie
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            color: '#fff',
            plugins: {
              datalabels: {
                formatter: (value, context) => {
                  const dataset = context.chart.data.datasets[0]
                  const total = dataset.data.reduce((acc, val) => acc + val, 0)
                  const percentage = Math.round((value / total) * 100)
                  return `${percentage}%`
                },
                color: '#fff',
                font: {
                  weight: 'bold',
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export function DMARCResultsChart({ records }) {
  const resultLabels = records.reduce((labels, record) => {
    const result =
      record.row &&
      record.row.policy_evaluated &&
      record.row.policy_evaluated.disposition
        ? record.row.policy_evaluated.disposition
        : null
    if (result && !labels.includes(result)) {
      labels.push(result)
    }
    return labels
  }, [])

  const data = {
    labels: resultLabels,
    datasets: [
      {
        data: records.reduce(
          (acc, record) => {
            const result =
              record.row &&
              record.row.policy_evaluated &&
              record.row.policy_evaluated.disposition
                ? record.row.policy_evaluated.disposition
                : null
            if (result) {
              acc[resultLabels.indexOf(result)]++
            } else {
              acc[0]++
            }
            return acc
          },
          Array(resultLabels.length + 1).fill(0),
        ),

        backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 205, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="flex flex-col w-full items-center h-fit bg-gray-700 text-white p-5 rounded-md shadow-lg">
      <h2 className="text-xl font-bold">Total DMARC Disposition Results</h2>
      <div className="flex-grow">
        <Pie
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            color: '#fff',
            plugins: {
              datalabels: {
                formatter: (value, context) => {
                  const dataset = context.chart.data.datasets[0]
                  const total = dataset.data.reduce((acc, val) => acc + val, 0)
                  const percentage = Math.round((value / total) * 100)
                  return `${percentage}%`
                },
                color: '#fff',
                font: {
                  weight: 'bold',
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export function PolicyEvaluatedChart({ records, type = 'dkim' }) {
  const resultLabels = records.reduce((labels, record) => {
    const result =
      record.row &&
      record.row.policy_evaluated &&
      record.row.policy_evaluated[type]
        ? record.row.policy_evaluated[type]
        : null
    if (result && !labels.includes(result)) {
      labels.push(result)
    }
    return labels
  }, [])

  const data = {
    labels: resultLabels,
    datasets: [
      {
        data: records.reduce(
          (acc, record) => {
            const result =
              record.row &&
              record.row.policy_evaluated &&
              record.row.policy_evaluated[type]
                ? record.row.policy_evaluated[type]
                : null
            if (result) {
              acc[resultLabels.indexOf(result)]++
            } else {
              acc[0]++
            }
            return acc
          },
          Array(resultLabels.length + 1).fill(0),
        ),

        backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 205, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="flex flex-col w-full items-center h-fit bg-gray-700 text-white p-5 rounded-md shadow-lg">
      <h2 className="text-xl font-bold">{`Total ${type.toUpperCase()} Disposition Results`}</h2>
      <div className="flex-grow">
        <Pie
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            color: '#fff',
            plugins: {
              datalabels: {
                formatter: (value, context) => {
                  const dataset = context.chart.data.datasets[0]
                  const total = dataset.data.reduce((acc, val) => acc + val, 0)
                  const percentage = Math.round((value / total) * 100)
                  return `${percentage}%`
                },
                color: '#fff',
                font: {
                  weight: 'bold',
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export default AuthResultsChart
