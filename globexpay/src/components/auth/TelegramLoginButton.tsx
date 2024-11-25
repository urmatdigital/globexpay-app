'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: TelegramUser) => void
    }
    Telegram: {
      Login: {
        auth: (options: {
          bot_id: string
          request_access?: boolean
          lang?: string
        }, callback: (user: TelegramUser) => void) => void
      }
    }
  }
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
        body: JSON.stringify({
          ...user,
          api_id: process.env.NEXT_PUBLIC_TELEGRAM_API_ID,
          api_hash: process.env.NEXT_PUBLIC_TELEGRAM_API_HASH,
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка авторизации')
      }

      const data = await response.json()
      
      if (data.success) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error)
    }
  }, [router])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || '')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '8')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-lang', 'ru')
    script.setAttribute('data-auth-url', `${window.location.origin}/api/auth/telegram/callback`)

    const container = document.getElementById('telegram-login-bot')
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
    <div className="flex justify-center">
      <div 
        id="telegram-login-bot"
        className="telegram-login"
      />
    </div>
  )
}
