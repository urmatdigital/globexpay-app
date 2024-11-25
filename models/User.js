const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');

class User {
    static async create({ email, password, name, role = 'user', company_name = null, phone = null }) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const { data: user, error } = await supabase
                .from('users')
                .insert([{
                    email,
                    password: hashedPassword,
                    name,
                    role,
                    company_name,
                    phone
                }])
                .select()
                .single();

            if (error) throw error;

            // Создаем настройки пользователя по умолчанию
            await supabase
                .from('user_settings')
                .insert([{ user_id: user.id }]);

            return user;
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error) throw error;
            return user;
        } catch (error) {
            throw error;
        }
    }

    static async updateLastLogin(userId) {
        try {
            const { error } = await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;
        } catch (error) {
            throw error;
        }
    }

    static async getUserSettings(userId) {
        try {
            const { data: settings, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return settings;
        } catch (error) {
            throw error;
        }
    }

    static async updateUserSettings(userId, settings) {
        try {
            const { data: updatedSettings, error } = await supabase
                .from('user_settings')
                .update(settings)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return updatedSettings;
        } catch (error) {
            throw error;
        }
    }
}
