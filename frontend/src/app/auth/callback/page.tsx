"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function AuthCallback() {
  const router = useRouter()
  const { fetchUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The Django social auth will set the token in cookies or localStorage
        // We need to fetch the user data to determine the user type
        const user = await fetchUser()

        if (user) {
          // Redirect based on user type
          if (user.user_type === "admin") {
            router.push("/admin/dashboard")
          } else if (user.user_type === "employee") {
            router.push("/employee/dashboard")
          } else {
            router.push("/")
          }
        } else {
          setError("Authentication failed. Please try again.")
          setTimeout(() => {
            router.push("/login")
          }, 3000)
        }
      } catch (error) {
        console.error("Authentication callback error:", error)
        setError("Authentication failed. Please try again.")
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    }

    handleCallback()
  }, [fetchUser, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-red-500">
            <p className="text-xl font-semibold">{error}</p>
            <p className="mt-2">Redirecting to login page...</p>
          </div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  )
}
