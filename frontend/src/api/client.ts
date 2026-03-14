import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  res => res,
  err => {
    console.error('API 오류:', err.response?.data || err.message)
    return Promise.reject(err)
  }
)
