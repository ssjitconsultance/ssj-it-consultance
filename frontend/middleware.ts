import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const path = request.nextUrl.pathname

  // Define protected routes
  const adminRoutes = path.startsWith("/admin")
  const employeeRoutes = path.startsWith("/employee")
  const authRoutes = path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/forgot-password")

  // If trying to access protected routes without token, redirect to login
  if ((adminRoutes || employeeRoutes) && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Allow all other routes
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/login", "/signup", "/forgot-password"],
}
