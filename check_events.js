const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('id, title, regular_price, member_price, student_price, hygienist_price, early_bird_deadline, regular_standard_price, member_standard_price')
        .limit(5)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error:", error);
    } else {
        fs.writeFileSync('out_events.json', JSON.stringify(data, null, 2));
    }
}
checkEvents();
