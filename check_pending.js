require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { getUserEventPrice } = require('./src/lib/eventPricing');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- FETCHING RECENT EVENT MEMBERS ---');
    const { data: members, error: mErr } = await supabase
        .from('event_members')
        .select('*, events(*), users(*, member_profiles(*))')
        .order('joined_at', { ascending: false })
        .limit(10);

    if (mErr) {
        console.error('Error:', mErr);
        return;
    }

    for (const m of members) {
        const user = { ...m.users };
        if (m.users.member_profiles && m.users.member_profiles.length > 0) {
            user.category = m.users.member_profiles[0].category;
            user.position = m.users.member_profiles[0].position;
        }
        const priceInfo = getUserEventPrice(m.events, user);

        console.log(`\nEvent: ${m.events.title}`);
        console.log(`User: ${user.email} (Category: ${user.category})`);
        console.log(`Membership: ${user.membership_type} - ${user.membership_status}`);
        console.log(`DB price_paid: ${m.price_paid} | DB payment_status: ${m.payment_status}`);
        console.log(`Calculated Price Info:`, priceInfo);

        let isActuallyFreeForUser = false;
        if (m.events.is_paid && priceInfo.price === 0) {
            isActuallyFreeForUser = true;
        }

        let joined = false;
        let paymentPending = false;

        if (m.events.is_paid && m.payment_status === 'pending' && !isActuallyFreeForUser) {
            joined = false;
            paymentPending = true;
        }
        else if (
            m.events.is_paid &&
            m.payment_status !== 'completed' &&
            m.payment_status !== 'free' &&
            !isActuallyFreeForUser &&
            (m.price_paid == null || Number(m.price_paid) === 0 || isNaN(Number(m.price_paid)))
        ) {
            joined = false;
            paymentPending = true;
        }
        else if (m.events.is_paid && m.payment_status === 'pending' && isActuallyFreeForUser) {
            joined = true;
            paymentPending = false;
        }
        else {
            joined = true;
            paymentPending = false;
        }

        console.log(`RESULT -> Joined: ${joined} | Payment Pending: ${paymentPending}`);
    }
}

check();
