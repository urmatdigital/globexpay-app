const { supabase } = require('../config/supabase');

class Transaction {
    static async create({ user_id, invoice_id, amount, fee, currency_from, currency_to, exchange_rate, payment_method }) {
        try {
            const { data: transaction, error } = await supabase
                .from('transactions')
                .insert([{
                    user_id,
                    invoice_id,
                    amount,
                    fee,
                    currency_from,
                    currency_to,
                    exchange_rate,
                    payment_method,
                    transaction_reference: this.generateReference()
                }])
                .select()
                .single();

            if (error) throw error;
            return transaction;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const { data: transaction, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    invoice:invoices (*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return transaction;
        } catch (error) {
            throw error;
        }
    }

    static async findByUser(userId, { status = null, limit = 10, offset = 0 } = {}) {
        try {
            let query = supabase
                .from('transactions')
                .select(`
                    *,
                    invoice:invoices (*)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (status) {
                query = query.eq('status', status);
            }

            const { data: transactions, error } = await query;

            if (error) throw error;
            return transactions;
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(id, status) {
        try {
            const { data: transaction, error } = await supabase
                .from('transactions')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return transaction;
        } catch (error) {
            throw error;
        }
    }

    static generateReference() {
        const prefix = 'TRX';
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}-${timestamp}-${random}`.toUpperCase();
    }
}
