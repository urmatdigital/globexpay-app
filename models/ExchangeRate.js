const { supabase } = require('../config/supabase');

class ExchangeRate {
    static async getRate(currency_from, currency_to) {
        try {
            const { data: rate, error } = await supabase
                .from('exchange_rates')
                .select('rate')
                .eq('currency_from', currency_from)
                .eq('currency_to', currency_to)
                .single();

            if (error) throw error;
            return rate;
        } catch (error) {
            throw error;
        }
    }

    static async updateRate(currency_from, currency_to, rate) {
        try {
            const { data: updatedRate, error } = await supabase
                .from('exchange_rates')
                .upsert({
                    currency_from,
                    currency_to,
                    rate
                })
                .select()
                .single();

            if (error) throw error;
            return updatedRate;
        } catch (error) {
            throw error;
        }
    }

    static async getAllRates() {
        try {
            const { data: rates, error } = await supabase
                .from('exchange_rates')
                .select('*')
                .order('currency_from', { ascending: true });

            if (error) throw error;
            return rates;
        } catch (error) {
            throw error;
        }
    }

    static async calculateAmount(amount, currency_from, currency_to) {
        try {
            const rate = await this.getRate(currency_from, currency_to);
            if (!rate) {
                throw new Error('Exchange rate not found');
            }
            return amount * rate.rate;
        } catch (error) {
            throw error;
        }
    }
}
