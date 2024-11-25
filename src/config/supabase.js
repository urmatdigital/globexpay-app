const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://akduwbigcggqwsxdhcgh.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrZHV3YmlnY2dncXdzeGRoY2doIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjM2NDk4NywiZXhwIjoyMDQ3OTQwOTg3fQ.KDGlNkcThuvePCQyFmOCRb6tKiD8e9axCqwlYkCAMNw';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
