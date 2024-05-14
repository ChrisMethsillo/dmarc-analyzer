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

export { getDmarcReportsByDateRange, getDmarcReport }
