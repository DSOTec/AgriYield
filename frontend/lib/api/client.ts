import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agriyield_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data and redirect to signin
      localStorage.removeItem('agriyield_token')
      localStorage.removeItem('agriyield_user')
      
      // Only redirect if not already on auth pages
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/signin') && 
          !window.location.pathname.includes('/signup')) {
        window.location.href = '/signin'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
