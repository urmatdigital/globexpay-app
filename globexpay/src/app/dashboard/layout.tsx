'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Здесь можно добавить навигацию, сайдбар и т.д. */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
