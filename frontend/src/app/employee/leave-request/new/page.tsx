"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import Link from "next/link"
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa"

// Form validation schema
const leaveRequestSchema = yup.object().shape({
  start_date: yup.date().required("Start date is required"),
  end_date: yup.date().required("End date is required").min(yup.ref("start_date"), "End date must be after start date"),
  reason: yup.string().required("Reason is required"),
})

// Define the form data type
type LeaveRequestFormData = {
  start_date: Date
  end_date: Date
  reason: string
}

export default function NewLeaveRequest() {
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
  } = useForm<LeaveRequestFormData>({
    resolver: yupResolver(leaveRequestSchema) as any,
  })

  // Check if user is authenticated and is an employee
  if (typeof window !== "undefined") {
    if (!isAuthenticated || !isEmployee) {
      router.push("/login")
    }
  }

  const onSubmit = async (data: LeaveRequestFormData) => {
    try {
      setSubmitting(true)
      setError(null)

      // Format dates to YYYY-MM-DD
      const formattedData = {
        ...data,
        start_date: new Date(data.start_date).toISOString().split("T")[0],
        end_date: new Date(data.end_date).toISOString().split("T")[0],
      }

      // Submit leave request
      await axios.post("/api/leave-requests/", formattedData)

      setSuccess(true)
      reset()

      // Scroll to top to show success message
      window.scrollTo(0, 0)

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/employee/leave-requests")
      }, 2000)
    } catch (err: any) {
      console.error("Error submitting leave request:", err)
      if (err.response?.data) {
        // Format Django REST errors
        const errors = err.response.data
        const errorMessage = Object.keys(errors)
          .map((key) => `${key}: ${errors[key].join(" ")}`)
          .join(", ")
        setError(errorMessage)
      } else {
        setError("Failed to submit leave request. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary">New Leave Request</h1>
            <p className="text-gray-600">Submit a new leave request</p>
          </div>
          <Link href="/employee/leave-requests" className="flex items-center text-primary hover:text-primary-dark">
            <FaArrowLeft className="mr-2" />
            Back to Leave Requests
          </Link>
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
                <p className="text-sm text-green-700">
                  Leave request submitted successfully! Your request is pending approval.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-bold text-secondary mb-4 flex items-center">
                  <FaCalendarAlt className="mr-2 text-primary" />
                  Leave Details
                </h2>
              </div>

              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  {...register("start_date")}
                  min={new Date().toISOString().split("T")[0]} // Set min date to today
                />
                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  id="end_date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  {...register("end_date")}
                  min={new Date().toISOString().split("T")[0]} // Set min date to today
                />
                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Leave *
                </label>
                <textarea
                  id="reason"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Please provide a detailed reason for your leave request..."
                  {...register("reason")}
                ></textarea>
                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/employee/leave-requests")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
