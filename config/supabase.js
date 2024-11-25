const { createClient } = require('@supabase/supabase-js');

// Add debug logging
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[PRESENT]' : '[MISSING]');
console.log('Supabase Service Role:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '[PRESENT]' : '[MISSING]');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase configuration. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

module.exports = { supabase, supabaseAdmin };
