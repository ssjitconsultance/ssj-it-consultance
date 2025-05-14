"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="SSJ IT Consultance" width={150} height={50} className="h-10 w-auto" />
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === "/" ? "text-primary" : "text-gray-700 hover:text-primary"}`}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === "/about" ? "text-primary" : "text-gray-700 hover:text-primary"}`}
              >
                About
              </Link>
              <Link
                href="/services"
                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === "/services" ? "text-primary" : "text-gray-700 hover:text-primary"}`}
              >
                Services
              </Link>
              <Link
                href="/contact"
                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === "/contact" ? "text-primary" : "text-gray-700 hover:text-primary"}`}
              >
                Contact
              </Link>

              {isAuthenticated ? (
                <>
                  {user?.user_type === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith("/admin") ? "text-primary" : "text-gray-700 hover:text-primary"}`}
                    >
                      Admin
                    </Link>
                  )}
                  {user?.user_type === "employee" && (
                    <Link
                      href="/employee/dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith("/employee") ? "text-primary" : "text-gray-700 hover:text-primary"}`}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark">
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === "/" ? "text-primary" : "text-gray-700 hover:text-primary"}`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === "/about" ? "text-primary" : "text-gray-700 hover:text-primary"}`}
            >
              About
            </Link>
            <Link
              href="/services"
              className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === "/services" ? "text-primary" : "text-gray-700 hover:text-primary"}`}
            >
              Services
            </Link>
            <Link
              href="/contact"
              className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === "/contact" ? "text-primary" : "text-gray-700 hover:text-primary"}`}
            >
              Contact
            </Link>

            {isAuthenticated ? (
              <>
                {user?.user_type === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${pathname.startsWith("/admin") ? "text-primary" : "text-gray-700 hover:text-primary"}`}
                  >
                    Admin
                  </Link>
                )}
                {user?.user_type === "employee" && (
                  <Link
                    href="/employee/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${pathname.startsWith("/employee") ? "text-primary" : "text-gray-700 hover:text-primary"}`}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary hover:text-primary-dark"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
