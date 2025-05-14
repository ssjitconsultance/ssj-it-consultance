"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { FaCalendarAlt, FaPlus, FaTimes } from "react-icons/fa"

// Form validation schema
const leaveRequestSchema = yup
  .object({
    startDate: yup.date().required("Start date is required"),
    endDate: yup.date().required("End date is required").min(yup.ref("startDate"), "End date must be after start date"),
    reason: yup.string().required("Reason is required").min(10, "Reason must be at least 10 characters"),
  })
  .required()

type LeaveRequestFormData = yup.InferType<typeof leaveRequestSchema>

export default function EmployeeLeaveRequests() {
  const { user, isAuthenticated, isEmployee } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveRequestFormData>({
    resolver: yupResolver(leaveRequestSchema),
  })

  useEffect(() => {
    // Check if user is authenticated and is an employee
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!isEmployee) {
      router.push("/")
      return
    }

    // Fetch leave requests
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/leave-requests/my_leave_requests/")
        setLeaveRequests(response.data)
      } catch (err) {
        console.error("Error fetching leave requests:", err)
        setError("Failed to load leave requests. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaveRequests()
  }, [isAuthenticated, isEmployee, router])

  const onSubmit = async (data: LeaveRequestFormData) => {
    try {
      setSubmitting(true)
      const response = await axios.post("/api/leave-requests/", {
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason,
      })

      // Add the new leave request to the list
      setLeaveRequests([response.data, ...leaveRequests])

      // Reset form and hide it
      reset()
      setShowForm(false)
    } catch (err) {
      console.error("Error submitting leave request:", err)
      setError("Failed to submit leave request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leave requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Leave Requests</h1>
            <p className="text-gray-600">Request and manage your leave applications</p>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? (
                <>
                  <FaTimes className="mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" />
                  New Leave Request
                </>
              )}
            </button>
          </div>
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

        {/* Leave Request Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-secondary mb-4 flex items-center">
              <FaCalendarAlt className="text-primary mr-2" />
              New Leave Request
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    {...register("startDate")}
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    {...register("endDate")}
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Leave *
                </label>
                <textarea
                  id="reason"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Please provide a detailed reason for your leave request"
                  {...register("reason")}
                ></textarea>
                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    reset()
                    setShowForm(false)
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mr-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leave Requests List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Request Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Leave Period
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reason
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((request, index) => {
                    // Calculate duration in days
                    const startDate = new Date(request.start_date)
                    const endDate = new Date(request.end_date)
                    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end days

                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {diffDays} day{diffDays !== 1 ? "s" : ""}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{request.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No leave requests found. Use the "New Leave Request" button to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
