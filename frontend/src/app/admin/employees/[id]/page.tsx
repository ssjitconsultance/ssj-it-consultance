"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, useParams } from "next/navigation"
import axios from "@/lib/axios"
import Link from "next/link"
import {
  FaArrowLeft,
  FaEdit,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaBriefcase,
  FaCalendarAlt,
} from "react-icons/fa"

export default function EmployeeView() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [employee, setEmployee] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!isAdmin) {
      router.push("/")
      return
    }

    // Fetch employee data
    const fetchEmployee = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/employees/${employeeId}/`)
        setEmployee(response.data)
      } catch (err) {
        console.error("Error fetching employee:", err)
        setError("Failed to load employee data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
  }, [isAuthenticated, isAdmin, router, employeeId])

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div
            className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Not Found!</strong>
            <span className="block sm:inline"> Employee not found.</span>
          </div>
          <Link
            href="/admin/employees"
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark inline-block"
          >
            Back to Employees
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Employee Profile</h1>
            <p className="text-gray-600">View detailed information about this employee</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/admin/employees" className="flex items-center text-primary hover:text-primary-dark">
              <FaArrowLeft className="mr-2" />
              Back to Employees
            </Link>
            <Link
              href={`/admin/employees/${employeeId}/edit`}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center"
            >
              <FaEdit className="mr-2" />
              Edit Employee
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {employee.profile_picture ? (
                  <img
                    src={employee.profile_picture || "/placeholder.svg"}
                    alt={`${employee.first_name} ${employee.last_name}`}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="text-gray-400 text-4xl" />
                  </div>
                )}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {employee.first_name} {employee.last_name}
                </h2>
                <p className="text-lg text-gray-600">{employee.position}</p>
                <p className="text-sm text-gray-500">{employee.department}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Employee ID: {employee.employee_id || `EMP-${employee.id.toString().padStart(4, "0")}`}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaEnvelope className="mt-1 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{employee.user_email || "N/A"}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaPhone className="mt-1 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{employee.phone || "N/A"}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaBuilding className="mt-1 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900">{employee.address || "N/A"}</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaBriefcase className="mt-1 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="text-gray-900">{employee.position || "N/A"}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaBuilding className="mt-1 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="text-gray-900">{employee.department || "N/A"}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaCalendarAlt className="mt-1 text-primary mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Date Joined</p>
                      <p className="text-gray-900">{formatDate(employee.date_joined)}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional sections can be added here, such as attendance history, leave requests, etc. */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
            <p className="text-gray-500 text-sm">View the employee's recent attendance records and time logs.</p>
            <div className="mt-4">
              <Link
                href={`/admin/timesheet?employee=${employee.id}`}
                className="text-primary hover:text-primary-dark font-medium"
              >
                View Attendance History →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Requests</h3>
            <p className="text-gray-500 text-sm">View and manage the employee's leave requests and approvals.</p>
            <div className="mt-4">
              <Link
                href={`/admin/leave-requests?employee=${employee.id}`}
                className="text-primary hover:text-primary-dark font-medium"
              >
                View Leave Requests →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
