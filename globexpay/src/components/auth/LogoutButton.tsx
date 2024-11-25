'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <button
      onClick={handleLogout}
      className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
    >
      Выйти
    </button>
  )
}
