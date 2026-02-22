require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { getUserEventPrice } = require('./src/lib/eventPricing');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: events } = await supabase.from('events').select('*').limit(3);

    const { data: user } = await supabase.from('users').select('*, member_profiles(*)').eq('email', 'devsharmatech21@gmail.com').single();
    let loggedInUser = { ...user };
    if (user.member_profiles && user.member_profiles.length > 0) {
        loggedInUser.category = user.member_profiles[0].category;
    }

    for (const event of events) {
        const priceInfo = getUserEventPrice(event, loggedInUser);

        const { data: members } = await supabase.from('event_members')
            .select('*')
            .eq('event_id', event.id)
            .eq('user_id', user.id);

        const eventMemberData = members && members.length > 0 ? members[0] : null;

        let joined = false;
        let paymentPending = false;

        if (eventMemberData) {
            let isActuallyFreeForUser = false;
            if (event.is_paid && loggedInUser) {
                if (priceInfo.price === 0) {
                    isActuallyFreeForUser = true;
                }
            }

            if (event.is_paid && eventMemberData.payment_status === 'pending' && !isActuallyFreeForUser) {
                joined = false;
                paymentPending = true;
            }
            else if (
                event.is_paid &&
                eventMemberData.payment_status !== 'completed' &&
                eventMemberData.payment_status !== 'free' &&
                !isActuallyFreeForUser &&
                (eventMemberData.price_paid == null || Number(eventMemberData.price_paid) === 0 || isNaN(Number(eventMemberData.price_paid)))
            ) {
                joined = false;
                paymentPending = true;
            }
            else if (event.is_paid && eventMemberData.payment_status === 'pending' && isActuallyFreeForUser) {
                joined = true;
                paymentPending = false;
            }
            else {
                joined = true;
                paymentPending = false;
            }
        }

        console.log(`Event: ${event.title}`);
        console.log(`  Price: ${priceInfo.price} | Free? ${priceInfo.isFree}`);
        console.log(`  Event Member Record: ${eventMemberData ? 'YES' : 'NONE'}`);
        console.log(`  -> Final joined Output: ${joined}`);
        console.log(`  -> Final pending Output: ${paymentPending}`);
    }
}

check();
