"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import Link from "next/link"
import { FaArrowLeft, FaUserPlus } from "react-icons/fa"

// Form validation schema
const employeeSchema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  position: yup.string().required("Position is required"),
  department: yup.string().required("Department is required"),
  phone: yup.string().nullable(),
  send_credentials: yup.boolean(),
})

// Define the form data type
type EmployeeFormData = {
  first_name: string
  last_name: string
  email: string
  position: string
  department: string
  phone: string | null
  send_credentials: boolean
}

export default function AddEmployee() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [employeeId, setEmployeeId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: yupResolver(employeeSchema) as any,
    defaultValues: {
      send_credentials: true,
    },
  })

  // Check if user is authenticated and is an admin
  if (typeof window !== "undefined") {
    if (!isAuthenticated || !isAdmin) {
      router.push("/login")
    }
  }

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setSubmitting(true)
      setError(null)

      // Create employee with all required data
      const response = await axios.post("/api/employees/", {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        position: data.position,
        department: data.department,
        phone: data.phone,
        send_credentials: data.send_credentials,
      })

      setSuccess(true)
      setEmployeeId(response.data.employee_id)
      reset()

      // Scroll to top to show success message
      window.scrollTo(0, 0)
    } catch (err: any) {
      console.error("Error creating employee:", err)
      if (err.response?.data) {
        // Format Django REST errors
        const errors = err.response.data
        const errorMessage = Object.keys(errors)
          .map((key) => `${key}: ${errors[key].join(" ")}`)
          .join(", ")
        setError(errorMessage)
      } else {
        setError("Failed to create employee. Please try again.")
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
            <h1 className="text-3xl font-bold text-secondary">Add New Employee</h1>
            <p className="text-gray-600">Create a new employee account and profile</p>
          </div>
          <Link href="/admin/employees" className="flex items-center text-primary hover:text-primary-dark">
            <FaArrowLeft className="mr-2" />
            Back to Employees
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
                  Employee account created successfully!
                  {employeeId && <span className="font-semibold"> Employee ID: {employeeId}</span>}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {register("send_credentials") && "Login credentials have been sent to the employee's email."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-bold text-secondary mb-4 flex items-center">
                  <FaUserPlus className="mr-2 text-primary" />
                  Personal Information
                </h2>
              </div>

              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  {...register("first_name")}
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  {...register("last_name")}
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  {...register("email")}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  {...register("phone")}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              {/* Job Information */}
              <div className="md:col-span-2 pt-4 border-t border-gray-200">
                <h2 className="text-xl font-bold text-secondary mb-4">Job Information</h2>
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Position *
                </label>
                <input
                  type="text"
                  id="position"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  {...register("position")}
                />
                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>}
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  id="department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  {...register("department")}
                >
                  <option value="">Select Department</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
                {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>}
              </div>

              {/* Account Information */}
              <div className="md:col-span-2 pt-4 border-t border-gray-200">
                <h2 className="text-xl font-bold text-secondary mb-4">Account Information</h2>
                <p className="text-sm text-gray-600 mb-4">
                  A random secure password will be generated for the employee.
                  {register("send_credentials") && " This password will be sent to the employee's email address."}
                </p>
              </div>

              <div className="md:col-span-2 flex items-center">
                <input
                  type="checkbox"
                  id="send_credentials"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  {...register("send_credentials")}
                />
                <label htmlFor="send_credentials" className="ml-2 block text-sm text-gray-700">
                  Send login credentials to employee's email
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/admin/employees")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {submitting ? "Creating..." : "Create Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
