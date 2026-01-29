import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local so this script can run outside Next.js
dotenv.config({ path: ".env.local" });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function backfillMembershipPayments() {
  console.log("\n=== Backfilling membership_payments into payment_history ===");

  // 1) Load all completed/paid membership payments
  const { data: membershipPayments, error: paymentsError } = await supabase
    .from("membership_payments")
    .select(
      "id, user_id, amount, currency, paid, payment_type, membership_start_date, membership_end_date, created_at, paid_at"
    )
    .gt("amount", 0);

  if (paymentsError) {
    console.error("Failed to load membership_payments:", paymentsError.message || paymentsError);
    throw paymentsError;
  }

  if (!membershipPayments || membershipPayments.length === 0) {
    console.log("No membership_payments records found.");
    return { scanned: 0, inserted: 0, skippedExisting: 0 };
  }

  console.log(`Loaded ${membershipPayments.length} membership_payments records.`);

  // 2) Load existing payment_history records keyed by payment_id to avoid duplicates
  const { data: existingHistory, error: historyError } = await supabase
    .from("payment_history")
    .select("payment_id")
    .not("payment_id", "is", null);

  if (historyError) {
    console.error("Failed to load existing payment_history records:", historyError.message || historyError);
    throw historyError;
  }

  const existingPaymentIds = new Set(
    (existingHistory || [])
      .filter((row) => row.payment_id)
      .map((row) => String(row.payment_id))
  );

  console.log(`Found ${existingPaymentIds.size} existing payment_history records with payment_id.`);

  const rowsToInsert = [];
  let skippedExisting = 0;

  for (const p of membershipPayments) {
    const paymentId = String(p.id);

    // Skip if already present in payment_history (either from callbacks or previous runs)
    if (existingPaymentIds.has(paymentId)) {
      skippedExisting += 1;
      continue;
    }

    // Only backfill successful/paid payments
    const isPaid = !!p.paid;
    if (!isPaid) {
      continue;
    }

    const paymentFor = p.payment_type || "membership_payment";

    rowsToInsert.push({
      // Link directly to application users table; FK must reference public.users(id)
      user_id: p.user_id,
      payment_id: paymentId,
      invoice_id: null,
      amount: p.amount || 0,
      currency: p.currency || "BHD",
      status: "completed",
      payment_for: paymentFor,
      created_at: p.paid_at || p.created_at || new Date().toISOString(),
      details: {
        type: "membership",
        original_user_id: p.user_id,
        membership_start_date: p.membership_start_date || null,
        membership_end_date: p.membership_end_date || null,
        source_table: "membership_payments",
        source_id: p.id,
      },
    });
  }

  if (rowsToInsert.length === 0) {
    console.log("No new membership payments to backfill.");
    return { scanned: membershipPayments.length, inserted: 0, skippedExisting };
  }

  console.log(`Preparing to insert ${rowsToInsert.length} membership payment history records...`);

  const BATCH_SIZE = 200;
  let inserted = 0;

  for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
    const batch = rowsToInsert.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase
      .from("payment_history")
      .insert(batch);

    if (insertError) {
      console.error("Error inserting membership payment_history batch:", insertError.message || insertError);
      throw insertError;
    }

    inserted += batch.length;
    console.log(`Inserted ${inserted}/${rowsToInsert.length} membership payment_history records...`);
  }

  console.log("Membership payments backfill completed.");
  return { scanned: membershipPayments.length, inserted, skippedExisting };
}

async function backfillEventMembers() {
  console.log("\n=== Backfilling event_members into payment_history ===");

  // 1) Load all event member records with a non-zero paid amount
  const { data: eventMembers, error: membersError } = await supabase
    .from("event_members")
    .select("id, user_id, event_id, price_paid, joined_at, events(title)")
    .gt("price_paid", 0);

  if (membersError) {
    console.error("Failed to load event_members:", membersError.message || membersError);
    throw membersError;
  }

  if (!eventMembers || eventMembers.length === 0) {
    console.log("No event_members records with price_paid > 0 found.");
    return { scanned: 0, inserted: 0, skippedExisting: 0 };
  }

  console.log(`Loaded ${eventMembers.length} event_members records with price_paid > 0.`);

  // 2) Load existing payment_history records that already reference event_members
  const { data: existingHistory, error: historyError } = await supabase
    .from("payment_history")
    .select("details");

  if (historyError) {
    console.error("Failed to load existing payment_history details:", historyError.message || historyError);
    throw historyError;
  }

  const existingEventSourceIds = new Set();

  for (const row of existingHistory || []) {
    const d = row.details;
    if (d && d.source_table === "event_members" && d.source_id) {
      existingEventSourceIds.add(String(d.source_id));
    }
  }

  console.log(`Found ${existingEventSourceIds.size} existing payment_history records linked to event_members.`);

  const rowsToInsert = [];
  let skippedExisting = 0;

  for (const e of eventMembers) {
    const sourceId = String(e.id);

    if (existingEventSourceIds.has(sourceId)) {
      skippedExisting += 1;
      continue;
    }

    rowsToInsert.push({
      // Link directly to application users table; FK must reference public.users(id)
      user_id: e.user_id,
      payment_id: null,
      invoice_id: null,
      amount: e.price_paid || 0,
      currency: "BHD",
      status: "completed",
      payment_for: "event_registration",
      created_at: e.joined_at || new Date().toISOString(),
      details: {
        type: "event",
        original_user_id: e.user_id,
        event_id: e.event_id,
        event_title: e.events?.title || null,
        source_table: "event_members",
        source_id: e.id,
      },
    });
  }

  if (rowsToInsert.length === 0) {
    console.log("No new event member payments to backfill.");
    return { scanned: eventMembers.length, inserted: 0, skippedExisting };
  }

  console.log(`Preparing to insert ${rowsToInsert.length} event payment history records...`);

  const BATCH_SIZE = 200;
  let inserted = 0;

  for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
    const batch = rowsToInsert.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase
      .from("payment_history")
      .insert(batch);

    if (insertError) {
      console.error("Error inserting event payment_history batch:", insertError.message || insertError);
      throw insertError;
    }

    inserted += batch.length;
    console.log(`Inserted ${inserted}/${rowsToInsert.length} event payment_history records...`);
  }

  console.log("Event members backfill completed.");
  return { scanned: eventMembers.length, inserted, skippedExisting };
}

async function fixExistingUserIds() {
  console.log("\n=== Fixing user_id for existing payment_history rows ===");

  const { data: rows, error } = await supabase
    .from("payment_history")
    .select("id, user_id, details")
    .is("user_id", null);

  if (error) {
    console.error("Failed to load payment_history rows with null user_id:", error.message || error);
    throw error;
  }

  if (!rows || rows.length === 0) {
    console.log("No payment_history rows with null user_id to fix.");
    return { scanned: 0, updated: 0, notFound: 0 };
  }

  const originalIds = Array.from(
    new Set(
      rows
        .map((r) => r.details?.original_user_id)
        .filter((id) => !!id)
    )
  );

  let updated = 0;
  let notFound = 0;

  for (const row of rows) {
    const originalId = row.details?.original_user_id;
    if (!originalId) {
      notFound += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from("payment_history")
      .update({ user_id: originalId })
      .eq("id", row.id);

    if (updateError) {
      console.error(
        `Failed to update user_id for payment_history row ${row.id}:`,
        updateError.message || updateError
      );
      continue;
    }

    updated += 1;
  }

  console.log(
    `Fixed user_id for ${updated} payment_history row(s); ${notFound} row(s) had no matching auth.users record.\n`
  );

  return { scanned: rows.length, updated, notFound };
}

async function main() {
  try {
    const membershipResult = await backfillMembershipPayments();
    const eventResult = await backfillEventMembers();
    const fixResult = await fixExistingUserIds();

    console.log("\n=== Backfill summary ===");
    console.log("Membership payments:", membershipResult);
    console.log("Event members:", eventResult);
    console.log("User_id fixes:", fixResult);
  } catch (err) {
    console.error("Backfill script failed:", err.message || err);
    process.exit(1);
  }
}

// Run immediately when executed with Node
main().then(() => {
  console.log("\nBackfill script finished.");
  process.exit(0);
});
