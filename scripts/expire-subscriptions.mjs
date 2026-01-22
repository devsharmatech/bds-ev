import { supabase } from "../src/lib/supabaseAdmin.js";

async function main() {
  try {
    const now = new Date().toISOString();

    console.log("Scanning for subscriptions that expired before:", now);

    const { data: subs, error: fetchError } = await supabase
      .from("user_subscriptions")
      .select("id, user_id, expires_at, status")
      .lt("expires_at", now)
      .neq("status", "expired");

    if (fetchError) throw fetchError;

    if (!subs || subs.length === 0) {
      console.log("No subscriptions to mark as expired.");
      return;
    }

    console.log(`Found ${subs.length} subscription(s) to expire.`);

    const userIds = new Set();

    // Mark each subscription as expired
    for (const s of subs) {
      const { error: updateErr } = await supabase
        .from("user_subscriptions")
        .update({ status: "expired" })
        .eq("id", s.id);

      if (updateErr) {
        console.error(`Failed to update subscription ${s.id}:`, updateErr.message || updateErr);
      } else {
        userIds.add(s.user_id);
        console.log(`Marked subscription ${s.id} as expired (user ${s.user_id}).`);
      }
    }

    // For each affected user, check if they still have any active subscription
    for (const uid of userIds) {
      const { count, error: countErr } = await supabase
        .from("user_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("status", "active")
        .gt("expires_at", now);

      if (countErr) {
        console.error(`Failed to check active subscriptions for user ${uid}:`, countErr.message || countErr);
        continue;
      }

      // If user has no active subscriptions, mark membership status inactive
      if (!count || count === 0) {
        const { error: userUpdateErr } = await supabase
          .from("users")
          .update({ membership_status: "inactive" })
          .eq("id", uid);

        if (userUpdateErr) {
          console.error(`Failed to set membership_status inactive for user ${uid}:`, userUpdateErr.message || userUpdateErr);
        } else {
          console.log(`User ${uid} membership_status set to inactive.`);
        }
      } else {
        console.log(`User ${uid} still has ${count} active subscription(s); membership left unchanged.`);
      }
    }

    console.log("Expire-script completed.");
  } catch (err) {
    console.error("Error running expire script:", err.message || err);
    process.exit(1);
  }
}

// Run
if (require.main === module) {
  main().then(() => process.exit(0));
}
