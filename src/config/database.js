const { supabase } = require('../../config/supabase');

// Helper function to execute database queries
const query = async (text, params) => {
    try {
        const { data, error } = await supabase
            .from(text)
            .select()
            .match(params || {});
            
        if (error) throw error;
        return { rows: data };
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    }
};

module.exports = {
    query,
    supabase
};
