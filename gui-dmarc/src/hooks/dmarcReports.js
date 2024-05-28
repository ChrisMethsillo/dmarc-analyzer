import axios from 'axios'
import endpoints from './endpoints.json'
const URL = import.meta.env.VITE_BACKEND_URL

function getDmarcReportsByDateRange(startDate, endDate) {
  return axios.get(`${URL}/${endpoints.aggregatedReportByDateRange}`, {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  })
}

function getDmarcReport(id) {
  return axios.get(`${URL}/${endpoints.aggregatedReport}/${id}`)
}

async function getIpsByRange(startDate, endDate) {
  startDate = startDate.toISOString()
  endDate = endDate.toISOString()
  const query = `
  {
    all_dmarc_reports_by_date_range(start_date: "${startDate}", end_date: "${endDate}") {
      record {
        row {
          source_ip,
          count
        }
      }
    }
  }
  `

  const urlQuery = `${URL}/${endpoints.graphQl}/`
  const headers = {
    'Content-Type': 'application/json',
  }

  try {
    const response = await axios.post(urlQuery, { query }, { headers })
    if (response.data && response.data.data) {
      const reports = response.data.data.all_dmarc_reports_by_date_range
      const ipCount = {}

      reports.forEach((report) => {
        report.record.forEach((record) => {
          const ip = record.row.source_ip
          const count = record.row.count
          if (!ip) {
            return
          }
          if (ip in ipCount) {
            ipCount[ip] += count
          } else {
            ipCount[ip] = count
          }
        })
      })

      return ipCount
    } else {
      throw new Error('No data found in response')
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

async function getIdentifiersByDate(startDate, endDate) {
  startDate = startDate.toISOString()
  endDate = endDate.toISOString()
  const query = `
  {
    all_dmarc_reports_by_date_range(start_date: "${startDate}", end_date: "${endDate}") {
      record {
        row {
          count
        }
        identifiers {
          envelope_to,
          envelope_from,
          header_from,
        }
      }
    }
  }
  `

  const urlQuery = `${URL}/${endpoints.graphQl}/`
  const headers = {
    'Content-Type': 'application/json',
  }

  try {
    const response = await axios.post(urlQuery, { query }, { headers })
    if (response.data && response.data.data) {
      const reports = response.data.data.all_dmarc_reports_by_date_range
      const envelopeTo = {}
      const envelopeFrom = {}
      const headerFrom = {}

      reports.forEach((report) => {
        report.record.forEach((record) => {
          const identifier = record.identifiers
          const count = record.row?.count
          if (!identifier || !count) {
            return
          }
          if (identifier.envelope_to in envelopeTo) {
            envelopeTo[identifier.envelope_to] += count
          } else {
            envelopeTo[identifier.envelope_to] = count
          }
          if (identifier.envelope_from in envelopeFrom) {
            envelopeFrom[identifier.envelope_from] += count
          } else {
            envelopeFrom[identifier.envelope_from] = count
          }
          if (identifier.header_from in headerFrom) {
            headerFrom[identifier.header_from] += count
          } else {
            headerFrom[identifier.header_from] = count
          }
        })
      })

      return { envelopeTo, envelopeFrom, headerFrom }
    } else {
      throw new Error('No data found in response')
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

export {
  getDmarcReportsByDateRange,
  getDmarcReport,
  getIpsByRange,
  getIdentifiersByDate,
}
