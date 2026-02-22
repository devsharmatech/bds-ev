const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase credentials from .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    const { data, error } = await supabase
        .from('events')
        .select(`id, title, is_paid, regular_price, member_price, student_price, hygienist_price`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error:", error);
    } else {
        fs.writeFileSync('events_output.json', JSON.stringify(data, null, 2));
    }
}

checkUsers();
