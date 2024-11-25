import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Конфигурация для S3 хранилища
export const s3Config = {
  url: process.env.SUPABASE_S3_URL,
  region: process.env.SUPABASE_S3_REGION,
  accessKey: process.env.SUPABASE_S3_ACCESS_KEY,
  secretKey: process.env.SUPABASE_S3_SECRET_KEY,
}

// Вспомогательные функции для работы с базой данных
export const db = {
  // Пример функции для работы с пользователями
  users: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    async getByTelegramId(telegramId: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single()
      
      if (error) throw error
      return data
    }
  },

  // Пример функции для работы с кошельками
  wallets: {
    async getAllByUserId(userId: string) {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
      
      if (error) throw error
      return data
    },

    async create(wallet: { user_id: string; name: string; balance: number }) {
      const { data, error } = await supabase
        .from('wallets')
        .insert(wallet)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  // Пример функции для работы с транзакциями
  transactions: {
    async getRecentByUserId(userId: string, limit = 10) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    },

    async create(transaction: {
      user_id: string
      wallet_id: string
      amount: number
      type: 'income' | 'expense'
      description: string
    }) {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  }
}
