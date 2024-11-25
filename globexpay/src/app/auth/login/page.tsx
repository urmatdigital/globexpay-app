import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Вход | GlobExPay',
  description: 'Войдите в систему GlobExPay',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Войти в GlobExPay
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Выберите удобный способ входа
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <a
              href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.2647 2.42C21.98 2.19609 21.6364 2.07146 21.2789 2.06115C20.9214 2.05084 20.5704 2.15539 20.2734 2.36C20.2734 2.36 3.96472 12.04 2.76472 12.94C2.59472 13.07 1.45472 13.81 1.51472 15.05C1.56472 16.29 2.54472 16.95 2.68472 17.07C3.85472 17.93 6.07472 18.9 6.86472 19.22C7.06472 19.3 7.81472 19.6 8.29472 19.61C8.72472 19.62 9.13472 19.5 9.45472 19.26C9.45472 19.26 14.7847 15.32 17.4547 13.29C17.8447 12.98 18.0447 13.05 17.9547 13.29C17.7647 13.83 13.5347 17.76 13.5347 17.76L13.5247 17.77C13.2947 17.98 13.1547 18.29 13.1547 18.61C13.1547 18.91 13.2847 19.19 13.5047 19.39C14.2247 20.04 17.2647 22.14 17.9547 22.58C18.0747 22.65 18.2047 22.72 18.3447 22.78C18.9947 23.09 19.7647 23.15 20.3647 22.95C21.0347 22.73 21.5547 22.21 21.7647 21.49C21.9047 21 23.3447 6.32 23.4947 3.78C23.5047 3.58 23.4847 3.39 23.4547 3.19C23.4169 2.90264 23.3127 2.62977 23.1547 2.39C22.8847 2.36 22.5447 2.36 22.2647 2.42Z" />
                </svg>
              </span>
              Войти через Telegram
            </a>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Еще нет аккаунта?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
