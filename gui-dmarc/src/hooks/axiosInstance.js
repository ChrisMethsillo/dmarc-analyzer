import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    const tokenType = localStorage.getItem('tokenType')
    if (token && tokenType) {
      config.headers.Authorization = `${tokenType} ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default axiosInstance
