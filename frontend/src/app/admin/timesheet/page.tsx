"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { FaFilter, FaChevronLeft, FaChevronRight, FaDownload, FaEdit, FaCheck, FaTimes } from "react-icons/fa"

export default function AdminTimesheet() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [filteredRecords, setFilteredRecords] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])

  // Filters
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [employeeFilter, setEmployeeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10)

  // Edit mode
  const [editMode, setEditMode] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editTimeIn, setEditTimeIn] = useState("")
  const [editTimeOut, setEditTimeOut] = useState("")

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

    // Fetch data
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch employees
        const employeesResponse = await axios.get("/api/employees/")
        setEmployees(employeesResponse.data)

        // Fetch attendance records
        const attendanceResponse = await axios.get("/api/attendance/")
        setAttendanceRecords(attendanceResponse.data)
        setFilteredRecords(attendanceResponse.data)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load timesheet data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, isAdmin, router])

  // Apply filters
  const applyFilters = () => {
    let filtered = [...attendanceRecords]

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter((record) => record.date >= startDate)
    }

    if (endDate) {
      filtered = filtered.filter((record) => record.date <= endDate)
    }

    // Filter by employee
    if (employeeFilter !== "all") {
      filtered = filtered.filter((record) => record.employee === Number.parseInt(employeeFilter))
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter)
    }

    setFilteredRecords(filtered)
    setCurrentPage(1) // Reset to first page after filtering
  }

  // Reset filters
  const resetFilters = () => {
    setStartDate("")
    setEndDate("")
    setEmployeeFilter("all")
    setStatusFilter("all")
    setFilteredRecords(attendanceRecords)
    setCurrentPage(1)
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
  }

  // Format time for display
  const formatTime = (dateTimeString: string) => {
    if (!dateTimeString) return "N/A"
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format time for input
  const formatTimeForInput = (dateTimeString: string) => {
    if (!dateTimeString) return ""
    const date = new Date(dateTimeString)
    return date.toISOString().slice(0, 16) // Format: "YYYY-MM-DDTHH:MM"
  }

  // Calculate hours worked
  const calculateHours = (timeIn: string, timeOut: string) => {
    if (!timeIn || !timeOut) return "N/A"

    const timeInDate = new Date(timeIn)
    const timeOutDate = new Date(timeOut)
    const diff = (timeOutDate.getTime() - timeInDate.getTime()) / (1000 * 60 * 60)
    return diff.toFixed(2)
  }

  // Get employee name by ID
  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    return employee ? `${employee.first_name} ${employee.last_name}` : "Unknown"
  }

  // Handle edit record
  const startEdit = (record: any) => {
    setEditingRecord(record)
    setEditStatus(record.status)
    setEditTimeIn(record.time_in ? formatTimeForInput(record.time_in) : "")
    setEditTimeOut(record.time_out ? formatTimeForInput(record.time_out) : "")
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditingRecord(null)
    setEditMode(false)
  }

  const saveEdit = async () => {
    if (!editingRecord) return

    try {
      const updatedRecord = {
        ...editingRecord,
        status: editStatus,
        time_in: editTimeIn || null,
        time_out: editTimeOut || null,
      }

      const response = await axios.patch(`/api/attendance/${editingRecord.id}/`, updatedRecord)

      // Update state
      const updatedRecords = attendanceRecords.map((record) =>
        record.id === editingRecord.id ? response.data : record,
      )
      setAttendanceRecords(updatedRecords)
      setFilteredRecords(filteredRecords.map((record) => (record.id === editingRecord.id ? response.data : record)))

      // Exit edit mode
      setEditMode(false)
      setEditingRecord(null)
    } catch (err) {
      console.error("Error updating record:", err)
      setError("Failed to update attendance record. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timesheet data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Timesheet Management</h1>
            <p className="text-gray-600">View and manage employee attendance records</p>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center"
              onClick={() => {
                // In a real app, this would generate and download a CSV/PDF
                alert("This would download the timesheet as a CSV or PDF in a real application.")
              }}
            >
              <FaDownload className="mr-2" />
              Export Timesheet
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <FaFilter className="text-primary mr-2" />
            <h2 className="text-xl font-bold text-secondary">Filter Records</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                id="employee"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="all">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={applyFilters} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
              Apply Filters
            </button>

            <button onClick={resetFilters} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
              Reset
            </button>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                    Employee
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
                    Hours Worked
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.length > 0 ? (
                  currentRecords.map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(record.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getEmployeeName(record.employee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editMode && editingRecord?.id === record.id ? (
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                            <option value="half_day">Half Day</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === "present"
                                ? "bg-green-100 text-green-800"
                                : record.status === "absent"
                                  ? "bg-red-100 text-red-800"
                                  : record.status === "late"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : record.status === "half_day"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editMode && editingRecord?.id === record.id ? (
                          <input
                            type="datetime-local"
                            value={editTimeIn}
                            onChange={(e) => setEditTimeIn(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        ) : record.time_in ? (
                          formatTime(record.time_in)
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editMode && editingRecord?.id === record.id ? (
                          <input
                            type="datetime-local"
                            value={editTimeOut}
                            onChange={(e) => setEditTimeOut(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        ) : record.time_out ? (
                          formatTime(record.time_out)
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {calculateHours(record.time_in, record.time_out)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editMode && editingRecord?.id === record.id ? (
                          <div className="flex justify-end space-x-2">
                            <button onClick={saveEdit} className="text-green-600 hover:text-green-900" title="Save">
                              <FaCheck />
                            </button>
                            <button onClick={cancelEdit} className="text-red-600 hover:text-red-900" title="Cancel">
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(record)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{" "}
                    <span className="font-medium">
                      {indexOfLastRecord > filteredRecords.length ? filteredRecords.length : indexOfLastRecord}
                    </span>{" "}
                    of <span className="font-medium">{filteredRecords.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-primary border-primary text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
