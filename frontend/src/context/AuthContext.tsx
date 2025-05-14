"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "@/lib/axios"
import { useRouter } from "next/navigation"

type User = {
  id: number
  email: string
  first_name: string
  last_name: string
  user_type: "admin" | "employee" | "guest"
  employee_id?: string
  is_superuser?: boolean
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (identifier: string, password: string, userType: string) => Promise<void>
  logout: () => void
  register: (data: any) => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isEmployee: boolean
  fetchUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      if (!token) {
        setLoading(false)
        return null
      }

      // Set the Authorization header for all requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      const response = await axios.get("/api/auth/user/")
      const userData = response.data

      // Ensure we have the user_type property
      if (!userData.user_type && userData.is_superuser) {
        userData.user_type = "admin"
      }

      setUser(userData)

      // Return user data if needed
      if (userData) {
        return userData
      }

      return null
    } catch (error) {
      console.error("Failed to fetch user:", error)
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update the login function to handle JWT authentication
  const login = async (identifier: string, password: string, userType: string) => {
    try {
      // Determine if identifier is email or employee_id based on userType
      const loginData =
        userType === "employee" && !identifier.includes("@")
          ? {
              employee_id: identifier,
              password: password,
              user_type: userType,
            }
          : {
              email: identifier,
              password: password,
              user_type: userType,
            }

      const response = await axios.post("/api/auth/token/", loginData)

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", response.data.access)
        localStorage.setItem("refresh_token", response.data.refresh)

        // Set the Authorization header for all requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`
      }

      // Set user data from the response
      if (response.data.user) {
        setUser(response.data.user)

        // Redirect based on user type
        if (response.data.user.user_type === "admin" || response.data.user.is_superuser) {
          router.push("/admin/dashboard")
        } else if (response.data.user.user_type === "employee") {
          router.push("/employee/dashboard")
        } else {
          router.push("/")
        }
      } else {
        // If user data is not included in the response, fetch it
        const userData = await fetchUser()

        if (userData) {
          // Redirect based on user type
          if (userData.user_type === "admin" || userData.is_superuser) {
            router.push("/admin/dashboard")
          } else if (userData.user_type === "employee") {
            router.push("/employee/dashboard")
          } else {
            router.push("/")
          }
        }
      }
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // No need to call a logout endpoint with JWT
      // Just remove the tokens from local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")

        // Remove the Authorization header
        delete axios.defaults.headers.common["Authorization"]
      }

      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const register = async (data: any) => {
    try {
      const response = await axios.post("/api/auth/registration/", {
        email: data.email,
        password1: data.password1,
        password2: data.password2,
        first_name: data.firstName,
        last_name: data.lastName,
        user_type: data.userType || "guest",
      })

      if (response.data.access) {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", response.data.access)
          localStorage.setItem("refresh_token", response.data.refresh)

          // Set the Authorization header for all requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`
        }
      }

      await fetchUser()
      router.push("/")
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        isAdmin: user?.user_type === "admin" || !!user?.is_superuser,
        isEmployee: user?.user_type === "employee",
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
