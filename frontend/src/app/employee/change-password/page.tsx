"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { FaLock, FaKey } from "react-icons/fa"

// Form validation schema
const passwordSchema = yup.object().shape({
  old_password: yup.string().required("Current password is required"),
  new_password1: yup.string().required("New password is required").min(8, "Password must be at least 8 characters"),
  new_password2: yup
    .string()
    .oneOf([yup.ref("new_password1")], "Passwords must match")
    .required("Confirm password is required"),
})

// Define the form data type
type PasswordFormData = {
  old_password: string
  new_password1: string
  new_password2: string
}

export default function ChangePassword() {
  const { isAuthenticated, isEmployee } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema) as any,
  })

  // Check if user is authenticated and is an employee
  if (typeof window !== "undefined") {
    if (!isAuthenticated || !isEmployee) {
      router.push("/login")
    }
  }

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(false)

      await axios.post("/api/auth/password/change/", {
        old_password: data.old_password,
        new_password1: data.new_password1,
        new_password2: data.new_password2,
      })

      setSuccess(true)
      reset()

      // Scroll to top to show success message
      window.scrollTo(0, 0)
    } catch (err: any) {
      console.error("Error changing password:", err)
      if (err.response?.data) {
        // Format Django REST errors
        const errors = err.response.data
        const errorMessage = Object.keys(errors)
          .map((key) => `${key}: ${errors[key].join(" ")}`)
          .join(", ")
        setError(errorMessage)
      } else {
        setError("Failed to change password. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Change Password</h1>
          <p className="text-gray-600">Update your account password</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Password changed successfully!</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="old_password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  {...register("old_password")}
                />
              </div>
              {errors.old_password && <p className="mt-1 text-sm text-red-600">{errors.old_password.message}</p>}
            </div>

            <div>
              <label htmlFor="new_password1" className="block text-sm font-medium text-gray-700 mb-1">
                New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="new_password1"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  {...register("new_password1")}
                />
              </div>
              {errors.new_password1 && <p className="mt-1 text-sm text-red-600">{errors.new_password1.message}</p>}
              <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long.</p>
            </div>

            <div>
              <label htmlFor="new_password2" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="new_password2"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  {...register("new_password2")}
                />
              </div>
              {errors.new_password2 && <p className="mt-1 text-sm text-red-600">{errors.new_password2.message}</p>}
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/employee/profile")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {submitting ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
