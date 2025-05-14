"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function SyncUsersPage() {
  const [loading, setLoading] = useState(false)
  const [sendCredentials, setSendCredentials] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const handleSync = async () => {
    try {
      setLoading(true)

      const response = await axios.post("/api/admin/sync-microsoft-users/", {
        send_credentials: sendCredentials,
      })

      toast({
        title: "Success",
        description: "User synchronization initiated successfully.",
        variant: "default",
      })

      // Redirect to employees page after successful sync
      router.push("/admin/employees")
    } catch (error) {
      console.error("Sync failed:", error)

      toast({
        title: "Error",
        description: "Failed to synchronize users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Sync Microsoft 365 Users</CardTitle>
          <CardDescription>This will synchronize users from Microsoft 365 to the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="send-credentials"
              checked={sendCredentials}
              onCheckedChange={(checked) => setSendCredentials(checked as boolean)}
            />
            <label
              htmlFor="send-credentials"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Send credentials to new users
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            If checked, new users will receive an email with their login credentials.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              "Sync Users"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
