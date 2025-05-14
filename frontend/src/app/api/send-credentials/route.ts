import { NextResponse } from "next/server"
import axios from "@/lib/axios"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { email, password, first_name, last_name } = data

    // Call your backend API to send the email using Graph API
    const response = await axios.post(`/api/send-email/`, {
      to: email,
      subject: "Your SSJ IT Consultance Account Credentials",
      template: "employee_credentials",
      context: {
        first_name,
        last_name,
        email,
        password,
      },
    })

    return NextResponse.json({ success: true, message: "Credentials sent successfully" })
  } catch (error) {
    console.error("Error sending credentials:", error)
    return NextResponse.json({ error: "Failed to send credentials" }, { status: 500 })
  }
}
