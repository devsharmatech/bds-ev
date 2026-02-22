const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
    const { data, error } = await supabase
        .from('member_profiles')
        .select('category, position, user_id');

    if (error) {
        console.error("Error:", error);
    } else {
        const cats = new Set(data.map(d => d.category));
        const pos = new Set(data.map(d => d.position));
        fs.writeFileSync('out2.json', JSON.stringify({ categories: [...cats], positions: [...pos] }, null, 2));
    }
}
checkCategories();
