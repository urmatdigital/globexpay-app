const { supabase } = require('../config/supabase');

class Invoice {
    static async create({ user_id, invoice_number, amount, currency, description = null, due_date = null, file_path = null }) {
        try {
            const { data: invoice, error } = await supabase
                .from('invoices')
                .insert([{
                    user_id,
                    invoice_number,
                    amount,
                    currency,
                    description,
                    due_date,
                    file_path
                }])
                .select()
                .single();

            if (error) throw error;
            return invoice;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const { data: invoice, error } = await supabase
                .from('invoices')
                .select(`
                    *,
                    transactions (*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return invoice;
        } catch (error) {
            throw error;
        }
    }

    static async findByUser(userId, { status = null, limit = 10, offset = 0 } = {}) {
        try {
            let query = supabase
                .from('invoices')
                .select(`
                    *,
                    transactions (*)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (status) {
                query = query.eq('status', status);
            }

            const { data: invoices, error } = await query;

            if (error) throw error;
            return invoices;
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(id, status) {
        try {
            const { data: invoice, error } = await supabase
                .from('invoices')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return invoice;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const { error } = await supabase
                .from('invoices')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            throw error;
        }
    }
}
