import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GlobexPay</h1>
          <LogoutButton />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Карточка загрузки документов */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Загрузка документов</h2>
            <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Загрузить документ
            </button>
          </div>
          
          {/* Карточка статистики */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Статистика</h2>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">Загружено документов: 0</p>
              <p className="text-gray-600 dark:text-gray-300">Обработано: 0</p>
            </div>
          </div>
          
          {/* Карточка баланса */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Баланс</h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">₽0.00</p>
          </div>
        </div>

        {/* Последние документы */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Последние документы</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Дата</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Название</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Статус</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400">Сумма</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-300" colSpan={4}>
                    Нет загруженных документов
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
