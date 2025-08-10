import { Suspense } from "react"
import AdminDashboard from "@/components/admin-dashboard"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}
