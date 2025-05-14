"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import Link from "next/link"
import {
  FaUsers,
  FaCalendarAlt,
  FaCog,
  FaUserPlus,
  FaChartBar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUserClock,
} from "react-icons/fa"

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaveRequests: 0,
  })
  const [recentEmployees, setRecentEmployees] = useState<any[]>([])
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState<any[]>([])

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

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch employees
        const employeesResponse = await axios.get("/api/employees/")
        const employees = employeesResponse.data

        // Fetch attendance for today
        const today = new Date().toISOString().split("T")[0]
        const attendanceResponse = await axios.get(`/api/attendance/?date=${today}`)
        const attendance = attendanceResponse.data

        // Fetch leave requests
        const leaveRequestsResponse = await axios.get("/api/leave-requests/")
        const leaveRequests = leaveRequestsResponse.data

        // Calculate stats
        const presentToday = attendance.filter((a: any) => a.status === "present").length
        const pendingLeaveRequests = leaveRequests.filter((lr: any) => lr.status === "pending").length

        setStats({
          totalEmployees: employees.length,
          presentToday,
          absentToday: employees.length - presentToday,
          pendingLeaveRequests,
        })

        // Get recent employees (last 5)
        setRecentEmployees(employees.slice(0, 5))

        // Get pending leave requests (last 5)
        setPendingLeaveRequests(leaveRequests.filter((lr: any) => lr.status === "pending").slice(0, 5))
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isAuthenticated, isAdmin, router])

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
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
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

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.first_name || user?.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Employees */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold text-secondary">{stats.totalEmployees}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/employees" className="text-sm text-primary hover:text-primary-dark">
                View all employees →
              </Link>
            </div>
          </div>

          {/* Present Today */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaCheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Present Today</p>
                <p className="text-2xl font-bold text-secondary">{stats.presentToday}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/timesheet" className="text-sm text-primary hover:text-primary-dark">
                View attendance →
              </Link>
            </div>
          </div>

          {/* Absent Today */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FaExclamationTriangle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Absent Today</p>
                <p className="text-2xl font-bold text-secondary">{stats.absentToday}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/timesheet" className="text-sm text-primary hover:text-primary-dark">
                View details →
              </Link>
            </div>
          </div>

          {/* Pending Leave Requests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaUserClock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Leave Requests</p>
                <p className="text-2xl font-bold text-secondary">{stats.pendingLeaveRequests}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/leave-requests" className="text-sm text-primary hover:text-primary-dark">
                Review requests →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-secondary mb-4">Quick Actions</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/employees/new"
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                <FaUserPlus className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-secondary">Add Employee</span>
            </Link>

            <Link
              href="/admin/timesheet"
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                <FaCalendarAlt className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-secondary">Manage Timesheet</span>
            </Link>

            <Link
              href="/admin/reports"
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                <FaChartBar className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-secondary">View Reports</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                <FaCog className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-secondary">Settings</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Employees */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">Recent Employees</h2>

            {recentEmployees.length > 0 ? (
              <div className="space-y-4">
                {recentEmployees.map((employee, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {employee.profile_picture ? (
                          <img
                            src={employee.profile_picture || "/placeholder.svg"}
                            alt={`${employee.first_name} ${employee.last_name}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <FaUsers className="text-gray-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-secondary">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{employee.position}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Joined {formatDate(employee.date_joined)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No employees found.</p>
            )}

            <div className="mt-4 text-right">
              <Link href="/admin/employees" className="text-primary hover:text-primary-dark font-medium">
                View All Employees →
              </Link>
            </div>
          </div>

          {/* Pending Leave Requests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">Pending Leave Requests</h2>

            {pendingLeaveRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingLeaveRequests.map((request, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-secondary">{request.employee_name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{request.reason}</p>
                    <div className="mt-2 flex space-x-2">
                      <button className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
                        Approve
                      </button>
                      <button className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pending leave requests.</p>
            )}

            <div className="mt-4 text-right">
              <Link href="/admin/leave-requests" className="text-primary hover:text-primary-dark font-medium">
                View All Requests →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
