import { Metadata } from 'next'
import TelegramLoginButton from '@/components/auth/TelegramLoginButton'

export const metadata: Metadata = {
  title: 'Вход | GlobExPay',
  description: 'Войдите в систему через Telegram',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Добро пожаловать в GlobExPay
          </h1>
          <p className="text-gray-300 mb-8">
            Войдите через Telegram для доступа к панели управления
          </p>
        </div>

        {/* Контейнер для кнопки Telegram */}
        <div className="bg-white/5 rounded-lg p-6 backdrop-blur-sm">
          <TelegramLoginButton />
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            Используя этот сервис, вы соглашаетесь с нашими условиями использования
            и политикой конфиденциальности
          </p>
        </div>
      </div>
    </div>
  )
}
