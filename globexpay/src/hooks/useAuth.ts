import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  telegram_id: number
  username?: string
  first_name?: string
  last_name?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()

        if (data.user) {
          setUser(data.user)
        } else {
          setUser(null)
          if (window.location.pathname.startsWith('/dashboard')) {
            router.push('/login')
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user
  }
}
