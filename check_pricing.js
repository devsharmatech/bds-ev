require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { getUserEventPrice } = require('./src/lib/eventPricing');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: event } = await supabase.from('events').select('*').eq('id', '43bd4558-7e4a-4c28-beab-dfc8abf803f2').single();
    const { data: user } = await supabase.from('users').select('*, member_profiles(*)').eq('email', 'devsharmatech21@gmail.com').single();

    let loggedInUser = { ...user };
    if (user.member_profiles && user.member_profiles.length > 0) {
        loggedInUser.category = user.member_profiles[0].category;
    }

    const priceInfo = getUserEventPrice(event, loggedInUser);
    console.log('Resulting priceInfo:', priceInfo);
}

check();
