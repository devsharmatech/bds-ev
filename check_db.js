require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: users, error: uErr } = await supabase.from('users').select('id, email, full_name').order('created_at', { ascending: false }).limit(20);
    console.log('--- RECENT USERS ---');
    for (const u of users) console.log(u.email, u.full_name);

    const { data: members, error: mErr } = await supabase.from('event_members')
        .select('*, events(title), users(email)')
        .order('joined_at', { ascending: false })
        .limit(10);

    console.log('\n--- RECENT EVENT_MEMBERS ---');
    for (const m of members) {
        console.log(`User: ${m.users?.email}, Event: ${m.events?.title}`);
        console.log(`  price_paid: ${m.price_paid}, payment_status: ${m.payment_status}`);
    }
}
run();
