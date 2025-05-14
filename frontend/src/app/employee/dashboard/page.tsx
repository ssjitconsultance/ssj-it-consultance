"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import Image from "next/image"
import Link from "next/link"
import { FaUser, FaCalendarAlt, FaClock, FaSignInAlt, FaSignOutAlt, FaEdit, FaKey } from "react-icons/fa"

export default function EmployeeDashboard() {
  const { user, isAuthenticated, isEmployee } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attendance, setAttendance] = useState<any>(null)
  const [clockingIn, setClockingIn] = useState(false)
  const [clockingOut, setClockingOut] = useState(false)
  const [recentAttendance, setRecentAttendance] = useState<any[]>([])

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

    // Fetch employee profile and attendance data
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch employee profile
        const profileResponse = await axios.get("/api/employees/me/")
        setProfile(profileResponse.data)

        // Fetch attendance data
        const attendanceResponse = await axios.get("/api/attendance/my_attendance/")

        // Get today's attendance if it exists
        const today = new Date().toISOString().split("T")[0]
        const todayAttendance = attendanceResponse.data.find((a: any) => a.date === today)
        setAttendance(todayAttendance || null)

        // Get recent attendance records (last 5)
        setRecentAttendance(attendanceResponse.data.slice(0, 5))
      } catch (err) {
        console.error("Error fetching employee data:", err)
        setError("Failed to load employee data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, isEmployee, router])

  const handleClockIn = async () => {
    try {
      setClockingIn(true)
      const response = await axios.post("/api/attendance/clock_in/")
      setAttendance(response.data)
    } catch (err) {
      console.error("Error clocking in:", err)
      setError("Failed to clock in. Please try again.")
    } finally {
      setClockingIn(false)
    }
  }

  const handleClockOut = async () => {
    try {
      setClockingOut(true)
      const response = await axios.post("/api/attendance/clock_out/")
      setAttendance(response.data)
    } catch (err) {
      console.error("Error clocking out:", err)
      setError("Failed to clock out. Please try again.")
    } finally {
      setClockingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee dashboard...</p>
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

  // Format time for display
  const formatTime = (dateTimeString: string) => {
    if (!dateTimeString) return "N/A"
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Employee Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {profile?.first_name} {profile?.last_name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="mr-4">
                {profile?.profile_picture ? (
                  <Image
                    src={profile.profile_picture || "/placeholder.svg"}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaUser className="text-gray-400 text-3xl" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-secondary">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-gray-600">{profile?.position}</p>
                <p className="text-gray-500 text-sm">{profile?.department}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-700">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-700">{profile?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Joined</p>
                  <p className="text-gray-700">{formatDate(profile?.date_joined)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="text-gray-700">EMP-{profile?.id.toString().padStart(4, "0")}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/employee/profile"
                className="flex items-center justify-center w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-secondary mb-4 flex items-center">
              <FaClock className="mr-2 text-primary" />
              Today's Attendance
            </h2>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-700 font-medium">{formatDate(new Date().toISOString())}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium ${attendance ? "text-green-600" : "text-yellow-600"}`}>
                    {attendance ? "Present" : "Not Checked In"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clock In</p>
                  <p className="text-gray-700">{attendance?.time_in ? formatTime(attendance.time_in) : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clock Out</p>
                  <p className="text-gray-700">{attendance?.time_out ? formatTime(attendance.time_out) : "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleClockIn}
                  disabled={clockingIn || (attendance && attendance.time_in)}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSignInAlt className="mr-2" />
                  {clockingIn ? "Clocking In..." : "Clock In"}
                </button>

                <button
                  onClick={handleClockOut}
                  disabled={clockingOut || !attendance || !attendance.time_in || attendance.time_out}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSignOutAlt className="mr-2" />
                  {clockingOut ? "Clocking Out..." : "Clock Out"}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/employee/timesheet"
                className="flex items-center justify-center w-full px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark"
              >
                <FaCalendarAlt className="mr-2" />
                View Full Timesheet
              </Link>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">Quick Links</h2>

            <ul className="space-y-3">
              <li>
                <Link href="/employee/profile" className="flex items-center p-3 rounded-md hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaUser className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary">My Profile</p>
                    <p className="text-sm text-gray-500">View and edit your profile</p>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/employee/timesheet" className="flex items-center p-3 rounded-md hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaCalendarAlt className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary">Timesheet</p>
                    <p className="text-sm text-gray-500">View your attendance history</p>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/employee/leave-requests" className="flex items-center p-3 rounded-md hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaCalendarAlt className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary">Leave Requests</p>
                    <p className="text-sm text-gray-500">Request and manage leaves</p>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/employee/change-password" className="flex items-center p-3 rounded-md hover:bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <FaKey className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary">Change Password</p>
                    <p className="text-xs text-gray-500">Update your account password</p>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-secondary mb-4">Recent Attendance</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Clock In
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Clock Out
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((record, index) => {
                    // Calculate hours worked if both clock in and clock out exist
                    let hoursWorked = "N/A"
                    if (record.time_in && record.time_out) {
                      const timeIn = new Date(record.time_in)
                      const timeOut = new Date(record.time_out)
                      const diff = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60)
                      hoursWorked = diff.toFixed(2)
                    }

                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(record.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === "present"
                                ? "bg-green-100 text-green-800"
                                : record.status === "absent"
                                  ? "bg-red-100 text-red-800"
                                  : record.status === "late"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.time_in ? formatTime(record.time_in) : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.time_out ? formatTime(record.time_out) : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hoursWorked}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No recent attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-right">
            <Link href="/employee/timesheet" className="text-primary hover:text-primary-dark font-medium">
              View All Records →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
