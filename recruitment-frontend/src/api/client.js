import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api'
const FILE_BASE_URL = API_URL.replace(/\/api\/?$/, '')

const api = axios.create({ baseURL: API_URL })

export function fileUrl(path) {
  if (!path) return null
  return `${FILE_BASE_URL}${path}`
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('recruiter_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api