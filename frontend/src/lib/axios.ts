import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Get the refresh token
        const refreshToken = localStorage.getItem("refresh_token")

        if (!refreshToken) {
          // No refresh token, redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            window.location.href = "/login"
          }
          return Promise.reject(error)
        }

        // Try to get a new token
        const response = await axios.post(`${baseURL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        // If we got a new token, save it and retry the request
        if (response.data.access) {
          localStorage.setItem("access_token", response.data.access)

          // Update the Authorization header
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`

          // Retry the original request
          return axios(originalRequest)
        }
      } catch (refreshError) {
        // If refresh failed, redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          window.location.href = "/login"
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
