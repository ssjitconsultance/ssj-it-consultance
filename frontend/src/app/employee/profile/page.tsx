"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import Image from "next/image"
import { FaUser, FaCamera } from "react-icons/fa"
import Link from "next/link"

// Form validation schema with proper types
const profileSchema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  phone: yup.string().nullable(),
  address: yup.string().nullable(),
  profile_picture: yup.mixed().nullable(),
})

// Define the form data type explicitly
type ProfileFormData = {
  first_name: string
  last_name: string
  phone: string | null
  address: string | null
  profile_picture?: FileList
}

export default function EmployeeProfile() {
  const { user, isAuthenticated, isEmployee } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema) as any, // Type assertion to fix TypeScript error
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

    // Fetch employee profile
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/employees/me/")
        setProfile(response.data)

        // Set form values
        setValue("first_name", response.data.first_name)
        setValue("last_name", response.data.last_name)
        setValue("phone", response.data.phone)
        setValue("address", response.data.address)

        // Set preview image if profile picture exists
        if (response.data.profile_picture) {
          setPreviewImage(response.data.profile_picture)
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [isAuthenticated, isEmployee, router, setValue])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(false)

      const formData = new FormData()
      formData.append("first_name", data.first_name)
      formData.append("last_name", data.last_name)

      if (data.phone) {
        formData.append("phone", data.phone)
      }

      if (data.address) {
        formData.append("address", data.address)
      }

      // Add profile picture if it exists
      if (data.profile_picture && data.profile_picture[0]) {
        formData.append("profile_picture", data.profile_picture[0])
      }

      const response = await axios.patch(`/api/employees/${profile.id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setProfile(response.data)
      setSuccess(true)

      // Scroll to top to show success message
      window.scrollTo(0, 0)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a preview URL for the selected image
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">My Profile</h1>
          <p className="text-gray-600">View and edit your personal information</p>
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
                <p className="text-sm text-green-700">Profile updated successfully!</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {previewImage ? (
                  <Image
                    src={previewImage || "/placeholder.svg"}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaUser className="text-gray-400 text-4xl" />
                  </div>
                )}

                <label
                  htmlFor="profile_picture"
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer"
                >
                  <FaCamera />
                  <input
                    type="file"
                    id="profile_picture"
                    className="hidden"
                    accept="image/*"
                    {...register("profile_picture")}
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500">Click the camera icon to change your profile picture</p>
            </div>

            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-bold text-secondary mb-4">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">Contact admin to change your email</p>
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
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div>
              <h2 className="text-xl font-bold text-secondary mb-4">Job Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    value={profile?.position || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    value={profile?.department || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                  />
                </div>

                <div>
                  <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    id="employee_id"
                    value={`EMP-${profile?.id.toString().padStart(4, "0")}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                  />
                </div>

                <div>
                  <label htmlFor="date_joined" className="block text-sm font-medium text-gray-700 mb-1">
                    Date Joined
                  </label>
                  <input
                    type="text"
                    id="date_joined"
                    value={profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-xl font-bold text-secondary mb-4">Address</h2>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Enter your full address"
                  {...register("address")}
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Link
                href="/employee/change-password"
                className="px-6 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark mr-3"
              >
                Change Password
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
