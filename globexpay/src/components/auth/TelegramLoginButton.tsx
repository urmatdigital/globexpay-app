'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: TelegramUser) => void
    }
  }
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export default function TelegramLoginButton() {
  const router = useRouter()

  const handleTelegramResponse = useCallback(async (user: TelegramUser) => {
    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      })

      if (!response.ok) {
        throw new Error('Ошибка авторизации')
      }

      const data = await response.json()
      
      if (data.session) {
        router.refresh() // Обновляем серверные компоненты
        router.push('/dashboard')
      } else {
        console.error('Сессия не создана')
      }
    } catch (error) {
      console.error('Ошибка при отправке данных:', error)
      alert('Ошибка при авторизации. Пожалуйста, попробуйте еще раз.')
    }
  }, [router])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '8')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-lang', 'ru')
    script.async = true

    const container = document.getElementById('telegram-login-container')
    if (container) {
      container.innerHTML = ''
      container.appendChild(script)
    }

    window.TelegramLoginWidget = {
      dataOnauth: handleTelegramResponse
    }

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [handleTelegramResponse])

  return (
    <div 
      id="telegram-login-container"
      className="flex justify-center items-center min-h-[50px]"
    />
  )
}
